export function requestBoardStatus(request, workflow) {
  if (workflow?.notifiedAt || request.status === 'matched') return 'matched';
  if (workflow?.selected || workflow?.applications?.some(application => application.status === 'sent')) return 'matching';
  return request.status;
}
