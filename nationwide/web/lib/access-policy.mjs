export function canAccess(user, record) {
  if (!user || user.status !== 'active') return false;
  if (user.role === 'admin') return true;
  if (user.role === 'hospital') return !!user.hospitalId && record.hospitalId === user.hospitalId;
  return user.role === 'caregiver' && record.ownerUserId === user.id;
}
export function canReview(user) { return user.status === 'active' && ['admin', 'hospital'].includes(user.role); }
