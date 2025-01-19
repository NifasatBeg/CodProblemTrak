chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
      problems: [],
      notifyDay: "Saturday",
      limit: 10,
      removalApproach: "Oldest",
      accessCount: {}
    });
  });
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "notifyUpsolve") {
      chrome.storage.local.get(["problems"], (result) => {
        if (result.problems && result.problems.length > 0) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Upsolve Reminder",
            message: `You have ${result.problems.length} problems to upsolve!`
          });
        }
      });
    }
  });
  
  function setupNotification() {
    chrome.storage.local.get(["notifyDay"], ({ notifyDay }) => {
      const days = { Saturday: 6, Sunday: 0 };
      const now = new Date();
      const dayOffset = (7 + days[notifyDay] - now.getDay()) % 7;
      const nextNotify = new Date(now);
      nextNotify.setDate(now.getDate() + dayOffset);
      nextNotify.setHours(10, 0, 0, 0);
  
      chrome.alarms.create("notifyUpsolve", { when: nextNotify.getTime(), periodInMinutes: 7 * 24 * 60 });
    });
  }
  
  setupNotification();
  
  function updateAccessCount(url) {
    chrome.storage.local.get(["accessCount"], ({ accessCount }) => {
      accessCount = accessCount || {};
      accessCount[url] = (accessCount[url] || 0) + 1;
      chrome.storage.local.set({ accessCount });
    });
  }
  
  function removeProblem(problems, removalApproach, accessCount) {
    if (removalApproach === "Oldest") {
      return problems.shift();
    } else if (removalApproach === "Most Accessed") {
      let maxAccess = -1;
      let mostAccessedProblem = null;
      problems.forEach((problem) => {
        if ((accessCount[problem] || 0) > maxAccess) {
          maxAccess = accessCount[problem];
          mostAccessedProblem = problem;
        }
      });
      problems = problems.filter((problem) => problem !== mostAccessedProblem);
      return problems;
    }
  }