const observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.addedNodes.length) {
      sendEvents(mutation.addedNodes[0])
    }
  })
})

function addObserverIfDesiredNodeAvailable(nodeName) {
  const node = document.querySelector(nodeName)
  if(!node) {
      //The node we need does not exist yet.
      //Wait 500ms and try again
      window.setTimeout(function() {
        addObserverIfDesiredNodeAvailable(nodeName)
      }, 500);
      return;
  }
  const config = { childList: true, attributes: true };
  observer.observe(node, config);
}

addObserverIfDesiredNodeAvailable('#game-log-text');

/* const loggedInUsernameNode = document.getElementById("header_profile_username")
console.log(loggedInUsernameNode)
if (loggedInUsernameNode) {
  const loggedInUsername = loggedInUsernameNode.innerText
  chrome.runtime.sendMessage({loggedInUsername}, function(response) {

  });
} */

function sendEvents(newNode) {
  const firstSpan = newNode.getElementsByTagName("span")[0]
  if (firstSpan.getElementsByTagName("hr")[0]) {
    return
  }

  const events = []
  let username
  let color

  function nextNode(el) {
    const node = el.nextSibling
    if (!node) {
      return
    }
  
    if (node.nodeName.toLowerCase() === 'img') {
      const alt = node.getAttribute("alt")
      events.push(alt)
    } else {
      if (node.textContent.length > 1) {
        events.push(node.textContent.trim())
      }
    }
  
    nextNode(node)
  }

  console.log("firstSpan", firstSpan)
  console.log("firstSpan.firstChild", firstSpan.firstChild)
  console.log("firstSpan.firstChild.nodeName", firstSpan.firstChild.nodeName)

  if (firstSpan.firstChild.nodeName.toLowerCase() !== 'span' || firstSpan.firstChild.nodeName.toLowerCase() !== 'img') {
    const text = firstSpan.firstChild.textContent
    events.push(text)
    nextNode(firstSpan.firstChild)
  } else {
    const secondSpan = firstSpan.getElementsByTagName("span")[0]
    username = secondSpan.textContent
    color = secondSpan.getAttribute("style").split(':')[1]
    nextNode(secondSpan)
  }

  chrome.runtime.sendMessage({username, color, events}, function(response) {

  });
}