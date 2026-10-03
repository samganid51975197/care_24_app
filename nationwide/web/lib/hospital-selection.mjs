export async function hospitalRecord(db,catalog,id){
 const hospital=catalog.find(h=>h.id===id);
 if(!hospital)return null;
 const exact=(await db.execute({sql:'SELECT id FROM auth_hospitals WHERE id=?',args:[id]})).rows;
 if(exact.length)return String(exact[0].id);
 if(catalog.filter(h=>h.name===hospital.name).length!==1)return null;
 const named=(await db.execute({sql:'SELECT id FROM auth_hospitals WHERE name=?',args:[hospital.name]})).rows;
 if(named.length===1)return String(named[0].id);
 if(named.length)return null;
 // Register only a known, unambiguous catalog hospital; never reassign existing records.
 await db.execute({sql:'INSERT INTO auth_hospitals(id,name) VALUES(?,?) ON CONFLICT(id) DO NOTHING',args:[hospital.id,hospital.name]});
 return hospital.id;
}
