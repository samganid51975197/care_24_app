function toast(text){document.getElementById('toast').textContent=text;setTimeout(()=>document.getElementById('toast').textContent='',5000)}
function openView(name){document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id===name))}
