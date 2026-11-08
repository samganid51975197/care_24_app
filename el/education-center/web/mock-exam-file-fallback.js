(() => {
  if (location.protocol !== 'file:') return;
  const dataScript = document.createElement('script');
  dataScript.src = new URL('./mock-exam-file-data.js', location.href).href;
  dataScript.onload = mountOfflineExam;
  dataScript.onerror = () => {
    const status = document.getElementById('answered');
    if (status) status.textContent = '문항 자료를 불러오지 못했습니다. mock-exam-file-data.js 파일이 web 폴더에 있는지 확인해 주세요.';
  };
  document.head.append(dataScript);

  function mountOfflineExam() {
    const banks = window.MOCK_EXAM_FILE_DATA || {};
    const requested = new URLSearchParams(location.search).get('exam') || 'general';
    const type = banks[requested] ? requested : 'general';
    const bank = banks[type];
    if (!bank?.questions?.length) return;
    const isSpecialty = !['general', 'disease', 'pressure'].includes(type);
    const pressureGuideSummary = document.getElementById('pressure-guide-summary');
    if (pressureGuideSummary) pressureGuideSummary.hidden = type !== 'pressure';
    const sourceGroupNames = new Map((bank.groups || []).map(group => [group[0], group[1]]));
    const questions = bank.questions.slice(0, 80);
    const groups = [];
    for (let start = 0; start < questions.length; start += 4) {
      const chunk = questions.slice(start, start + 4);
      const sourceIds = [...new Set(chunk.map(q => q.group))];
      const sourceNames = sourceIds.map(id => sourceGroupNames.get(id) || id);
      const id = `UNIT${String(groups.length + 1).padStart(2, '0')}`;
      const name = sourceNames.join(' · ');
      groups.push({ id, name, questions: chunk });
      chunk.forEach(question => { question.displayGroup = id; });
    }
    const answers = new Map();
    let current = 0;
    let graded = false;
    const $ = selector => document.querySelector(selector);
    const make = (tag, text, parent, className) => {
      const el = document.createElement(tag);
      if (text !== undefined) el.textContent = text;
      if (className) el.className = className;
      if (parent) parent.append(el);
      return el;
    };
    const title = isSpecialty ? `${bank.title} 모의고사` : type === 'general' ? '기본 간병교육 모의고사' : type === 'disease' ? '질환별 사례판단 모의고사' : '욕창 심화 모의고사';
    document.title = `${title} · 80문항`;
    const heading = $('header h1');
    heading.replaceChildren();
    make('span', title, heading);
    heading.append(document.createElement('br'));
    make('span', '총 80문항', heading);
    $('.eyebrow').textContent = '20개 평가 단위 · 단위별 4문항 · 총 80문항';
    const description = $('#exam-description');
    if (type === 'general') description.textContent = '기본 간병교육은 기존 S01–S10 교안의 10개 주제(경관영양·도뇨관·호흡·치매·뇌졸중·파킨슨·당뇨·투석·암·호스피스)를 복습합니다. 주제별 기본 확인·안전·보고를 다룹니다.';
    else if (type === 'disease') description.textContent = '질환별 사례판단은 환자 상황을 읽고 관찰할 변화·우선 대응·보고를 고르는 연습입니다. 치매·뇌졸중·파킨슨·당뇨·폐·신장·암 등 10개 영역을 다룹니다.';
    else if (type === 'pressure') description.textContent = '욕창 심화는 병태생리·분류·감별·사정·체위·지지면·환경·영양·감염·치유 등 10영역의 학습용 심화 문제입니다. 진단과 처치는 권한 있는 의료진의 업무입니다.';
    else description.textContent = `${bank.title} 과정의 사례별 80문항입니다. ${groups.length}개 평가 단위에서 환자 안전, 관찰, 허용된 보조, 보고와 후속 확인을 연습합니다.`;
    const status = $('#answered');
    const meter = $('#answered-meter');
    const saveStatus = $('#save-status');
    saveStatus.textContent = '파일로 연 학습 화면입니다. 답안은 현재 화면에만 유지되며 자동 저장되지 않습니다.';
    const nav = $('#group-nav');
    const host = $('#question-groups');
    const sectionElements = [];
    const navButtons = [];
    for (const [groupIndex, group] of groups.entries()) {
      const navButton = make('button', `${groupIndex + 1}부 · ${group.name}`, nav);
      navButton.type = 'button';
      navButton.addEventListener('click', () => showGroup(groupIndex));
      navButtons.push(navButton);
      const section = make('section', undefined, host, 'question-group group-head');
      section.id = `group-${group.id}`;
      const heading = make('h2', `${groupIndex + 1}부 · ${group.name}`, section);
      heading.tabIndex = -1;
      make('p', `문항 ${groupIndex * 4 + 1}–${groupIndex * 4 + group.questions.length} · ${group.questions.length}문항`, section, 'group-count');
      sectionElements.push(section);
      for (const q of group.questions) {
        const article = make('article', undefined, section, 'question');
        article.id = `question-${q.id}`;
        make('p', sourceGroupNames.get(q.group) || group.name, article, 'question-area');
        const fieldset = make('fieldset', undefined, article, 'question-card');
        const legend = make('legend', undefined, fieldset, 'question-heading');
        make('span', `문제 ${q.id}`, legend, 'question-number');
        make('span', q.prompt, legend, 'question-prompt');
        const options = make('div', undefined, fieldset, 'option-list');
        q.options.forEach((text, index) => {
          const label = make('label', undefined, options, 'option');
          const input = make('input', undefined, label);
          input.type = 'radio';
          input.name = `offline-q-${q.id}`;
          input.value = String(index);
          const number = make('span', String(index + 1), label, 'option-number');
          number.setAttribute('aria-hidden', 'true');
          make('span', text, label, 'option-text');
          input.addEventListener('change', () => {
            answers.set(q.id, index);
            graded = false;
            updateStatus();
            $('#result').hidden = true;
            article.querySelectorAll('.feedback').forEach(el => el.hidden = true);
          });
        });
        const feedback = make('div', undefined, article, 'feedback');
        feedback.hidden = true;
        feedback.dataset.question = String(q.id);
      }
    }
    function updateStatus() {
      status.textContent = `80문항 중 ${answers.size}문항 응답 · ${80 - answers.size}문항 미응답`;
      meter.value = answers.size;
      navButtons.forEach((button, index) => {
        const answeredInGroup = groups[index].questions.filter(q => answers.has(q.id)).length;
        button.textContent = `${index + 1}부 · ${groups[index].name} · ${answeredInGroup}/4`;
      });
      $('#grade').disabled = false;
      $('#retry').disabled = false;
      $('#print-exam').disabled = false;
    }
    function showGroup(index, scroll = false) {
      current = Math.max(0, Math.min(index, groups.length - 1));
      sectionElements.forEach((section, i) => { section.hidden = i !== current; });
      navButtons.forEach((button, i) => button.setAttribute('aria-current', String(i === current)));
      $('#previous').disabled = current === 0;
      $('#next').disabled = current === groups.length - 1;
      if (scroll) sectionElements[current].querySelector('h2').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    $('#grade').addEventListener('click', () => {
      graded = true;
      let correct = 0;
      for (const q of questions) {
        const feedback = document.querySelector(`.feedback[data-question="${q.id}"]`);
        feedback.replaceChildren();
        const selected = answers.get(q.id);
        const isCorrect = selected === q.answer;
        if (isCorrect) correct++;
        feedback.className = `feedback ${isCorrect ? 'correct' : 'wrong'}`;
        make('h3', `${isCorrect ? '정답' : selected === undefined ? '미응답' : '오답'} · 정답 ${q.answer + 1}번`, feedback);
        make('p', q.explanation || '해설은 해당 교안 단원에서 확인하세요.', feedback);
        const lesson = make('a', '교안 단원 복습 →', feedback);
        lesson.href = q.lesson || (type === 'pressure' ? 'pressure-advanced.html#P01' : ['general', 'disease'].includes(type) ? 'specialty-courses.html#catalog' : `specialty-courses.html?course=${encodeURIComponent(type)}#manual`);
        feedback.hidden = false;
      }
      const result = $('#result');
      result.replaceChildren();
      result.hidden = false;
      make('h2', '모의고사 채점 결과', result);
      make('p', `${correct} / 80문항 정답 · ${Math.round(correct / 80 * 1000) / 10}점`, result, 'score');
      make('p', `${80 - correct - (80 - answers.size)}문항 오답 · ${80 - answers.size}문항 미응답`, result);
      make('p', '학습 점수이며 정식 시험의 합격·불합격이나 자격 취득을 판정하지 않습니다.', result, 'hint');
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('#retry').addEventListener('click', () => {
      answers.clear();
      graded = false;
      document.querySelectorAll('#question-groups input[type="radio"]').forEach(input => input.checked = false);
      document.querySelectorAll('#question-groups .feedback').forEach(el => { el.hidden = true; el.replaceChildren(); });
      $('#result').hidden = true;
      updateStatus();
      showGroup(0, true);
    });
    $('#previous').addEventListener('click', () => showGroup(current - 1, true));
    $('#next').addEventListener('click', () => showGroup(current + 1, true));
    $('#print-exam').addEventListener('click', () => window.print());
    const hash = location.hash.match(/^#group-UNIT(\d+)$/);
    updateStatus();
    showGroup(hash ? Number(hash[1]) - 1 : 0);
  }
})();
