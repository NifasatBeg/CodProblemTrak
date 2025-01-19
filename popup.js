function saveLimit() {
    const limit = parseInt(document.getElementById("problem-limit").value, 10);
    chrome.storage.local.set({ limit }, () => {
      document.getElementById("status").textContent = "Problem limit saved!";
    });
  }
  
  function saveRemovalApproach() {
    const removalApproach = document.getElementById("removal-approach").value;
    chrome.storage.local.set({ removalApproach }, () => {
      document.getElementById("status").textContent = "Removal approach saved!";
    });
  }
  
  function addProblem() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      chrome.storage.local.get(["problems", "limit", "removalApproach", "accessCount"], ({ problems, limit, removalApproach, accessCount }) => {
        problems = problems || [];
        accessCount = accessCount || {};
        if (!problems.includes(url)) {
          if (problems.length >= limit) {
            problems = removeProblem(problems, removalApproach, accessCount);
          }
          problems.push(url);
          chrome.storage.local.set({ problems }, () => {
            document.getElementById("status").textContent = "Problem added!";
            displayProblems();
          });
        } else {
          document.getElementById("status").textContent = "Problem already exists!";
        }
      });
    });
  }
  
  function displayProblems() {
    chrome.storage.local.get(["problems"], ({ problems }) => {
      const problemList = document.getElementById("problem-list");
      problemList.innerHTML = ""; // Clear existing list
      (problems || []).forEach((problem, index) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = problem;
        link.textContent = `Problem ${index + 1}`;
        link.target = "_blank";
        li.appendChild(link);
        problemList.appendChild(li);
      });
    });
  }
  
  document.getElementById("save-limit").addEventListener("click", saveLimit);
  document.getElementById("save-removal-approach").addEventListener("click", saveRemovalApproach);
  document.getElementById("add-problem").addEventListener("click", addProblem);
  
  // Display problems when popup loads
  displayProblems();