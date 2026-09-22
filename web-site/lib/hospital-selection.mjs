export async function hospitalRecord(db,catalog,id){
 const hospital=catalog.find(h=>h.id===id);
 if(!hospital)return null;
 const exact=(await db.execute({sql:'SELECT id FROM auth_hospitals WHERE id=?',args:[id]})).rows;
 if(exact.length)return String(exact[0].id);
 if(catalog.filter(h=>h.name===hospital.name).length!==1)return null;
 const named=(await db.execute({sql:'SELECT id FROM auth_hospitals WHERE name=?',args:[hospital.name]})).rows;
 return named.length===1?String(named[0].id):null;
}
