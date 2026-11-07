import type { SiteContent } from './content';

export function getRegistrationState(registration: SiteContent['registration']) {
  const now = new Date();
  const isOpenMaster = registration.isOpen !== false;

  let isNotYetOpen = false;
  if (registration.opensOn) {
    const opensDate = new Date(registration.opensOn);
    if (!isNaN(opensDate.getTime()) && now < opensDate) {
      isNotYetOpen = true;
    }
  }

  let isPastDeadline = false;
  let deadlineLabel = '';
  if (registration.deadline) {
    const deadlineDate = new Date(registration.deadline);
    if (!isNaN(deadlineDate.getTime())) {
      if (now > deadlineDate) {
        isPastDeadline = true;
      }
      // Format IST: e.g. "5 Dec 2026, 5:00 PM IST"
      try {
        deadlineLabel = new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(deadlineDate);
      } catch {
        deadlineLabel = registration.deadline;
      }
    }
  }

  const isClosed = !isOpenMaster || isNotYetOpen || isPastDeadline;

  let stateMessage = '';
  if (isNotYetOpen) {
    stateMessage = registration.notYetOpenMessage;
  } else if (!isOpenMaster || isPastDeadline) {
    stateMessage = registration.closedMessage;
  }

  return {
    isOpen: !isClosed,
    isNotYetOpen,
    isPastDeadline,
    isClosed,
    stateMessage,
    deadlineLabel,
  };
}

