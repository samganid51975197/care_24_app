import {and,eq,or,isNull,sql} from 'drizzle-orm';
export function hospitalFilter(table,actor){return actor.contextHospitalId?(actor.legacyHospital?or(eq(table.hospitalId,actor.contextHospitalId),isNull(table.hospitalId)):eq(table.hospitalId,actor.contextHospitalId)):undefined;}
export function recordScope(table,actor){
 const access=actor.role==='admin'?sql`1 = 1`:actor.role==='hospital'?(actor.hospitalId?eq(table.hospitalId,actor.hospitalId):sql`1 = 0`):eq(table.ownerUserId,actor.id);
 return and(access,hospitalFilter(table,actor));
}
