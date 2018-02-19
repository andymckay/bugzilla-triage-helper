let syncCanned = {        
  "Dupe": {
    comment: ["We're sorry to hear you are having this problem. We've seen a number of reports like this, but we are unable to determine exactly what causes it. In the meantime I'm closing this as a duplicate of the bug where we are tracking this work and please accept our apologies for the problems you are having."],
  },
  "Error": {
    comment: ["We're sorry to hear you are having this problem, but thanks very much for taking the time to make this report. We aren't sure what is causing this issue, but Sync does keep some logs which may help us find the problem. Instructions for how to locate and attach the logs can be found at https://wiki.mozilla.org/CloudServices/Sync/File_a_desktop_bug - please follow those instructions and attach the sync logs to this bug. Again, thanks for the report and thanks for your help in finding these kinds of issues."],
  },
  "Logs": {
    comment: ["We're sorry to hear you are having this problem, but thanks very much for taking the time to make this report. We aren't sure what is causing this issue, but Sync does keep some logs which may help us find the problem. Instructions for how to locate and attach the logs can be found at https://wiki.mozilla.org/CloudServices/Sync/File_a_desktop_bug - and in particular, follow the instructions for enabling 'success' logs, then reproduce your issue (eg, perform a new sync), and attach any new logs which then appear."],
  },
  "Trace": {
    comment: ["We're sorry to hear you are having this problem, but thanks very much for taking the time to make this report. We aren't sure what is causing this issue. Sync does keep some logs which may help us find the problem but in this case it appears we need more detailed logs than Sync provides by default. Instructions for how to provide these detailed logs can be found at https://wiki.mozilla.org/CloudServices/Sync/File_a_desktop_bug#Get_detailed_Sync_logs in the 'Get detailed Sync logs' section. Once you've done that, please attach the logs as described on that page."],
  },
  "about:sync": {
    comment: ["Thanks for the report. To help us determine the cause of this issue, could you please install the about-sync addon from https://addons.mozilla.org/en-US/firefox/addon/about-sync/. This addon will let you view all of the data stored on the Sync servers. Again, thanks for the report and thanks for your help in finding the root cause of this problem."],
  },
  "new": {
    comment: ["Thanks for your interest in helping make Firefox great! The first step is to follow the guide at https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Introduction to learn how to build Firefox. Once you have done this you will have all of the files needed in a local checkout and it will be some of these files that will need to be changed. Please let us know in thus bug when you have got a Firefox build running locally and we'll give you some additional pointers for how to solve this bug."],
  }
};

let additionalEvents = { // eslint-disable-line no-unused-vars
  // Format: Bugzilla Product|Bugzilla Component|action id
  "Cloud Services|Firefox Sync: Backend|canned": syncCanned,
  "Cloud Services|Firefox Sync: Build|canned": syncCanned,
  "Cloud Services|Firefox Sync: Cross-client|canned": syncCanned,
  "Cloud Services|Firefox Sync: Crypto|canned": syncCanned,
  "Cloud Services|Firefox Sync: Other Clients|canned": syncCanned,
  "Firefox|Sync|canned": syncCanned,
  "Firefox for Android|Android Sync|canned": syncCanned,
  "Firefox for iOS|Sync|canned": syncCanned,
  
  // Issue 21
  "Core|Graphics: WebRender|priorityone": {
    "Blocking Nightly": {
        blocking: ["1386665"]
    },
    "Blocking Trains": {
        blocking: ["1386669"]
    }
  },
  "Core|Graphics: WebRender|defer": {
    "Blocking Trains": {
        blocking: ["1386669"]
    }
  },
  "Core|Graphics: WebRender|backlog": {
    "Blocking Backlog": {
        blocking: ["1386670"]
    }
  },
  "Core|Graphics|priorityone": {
    "Whiteboard": {
        whiteboard: ["[gfx-noted]"]
    }
  },
  "Core|Graphics|defer": {
    "Whiteboard": {
        whiteboard: ["[gfx-noted]"]
    }
  },
  "Core|Graphics|backlog": {
    "Whiteboardg": {
        whiteboard: ["[gfx-noted]"]
    }
  },
};


