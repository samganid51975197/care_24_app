export function readContractFields(content) {
  const fields = {body:'',fee:'',patientSignature:'',associationSignature:'',date:''};
  const body=[];
  for (const line of content.split(/\r?\n/)) {
    let match;
    if ((match=line.match(/^간병비: (.*)$/))) {
      fields.fee=match[1].match(/^(\d+)(?:원)?\s*\//)?.[1]||'';
      if(!fields.fee && !match[1].startsWith('미기재')) body.push(line);
    } else if ((match=line.match(/^(환자·보호자|환자\(보호자\)) 성명 및 서명:\s*(.*)$/))) {
      fields.patientSignature=/^[_\s]*$/.test(match[2])?'':match[2];
    } else if ((match=line.match(/^(협회·간병24 담당자|협회\(간병24\) 담당자) 성명 및 서명:\s*(.*)$/))) {
      fields.associationSignature=/^[_\s]*$/.test(match[2])?'':match[2];
    } else if ((match=line.match(/^계약일:\s*(.*)$/))) {
      if(/^\d{4}-\d{2}-\d{2}$/.test(match[1])) fields.date=match[1];
      else if(!/^[_\s]*$/.test(match[1])) body.push('기존 계약일 기록: '+match[1]);
    } else body.push(line);
  }
  fields.body=body.join('\n').trim();
  return fields;
}
export function writeContractFields(fields) {
  return [fields.body.trim(),`간병비: ${fields.fee}원 / 지급 단위: 24시간`,
    `환자(보호자) 성명 및 서명: ${fields.patientSignature}`,
    `협회(간병24) 담당자 성명 및 서명: ${fields.associationSignature}`,
    `계약일: ${fields.date}`].join('\n');
}
