let actions = [ // eslint-disable-line no-unused-vars
  {
    text: "Won't fix",
    id: "wontfix",
    events: {
      status: ["RESOLVED", "WONTFIX"]
    },
    keyboard: "1"
  },
  {
    text: "Incomplete",
    id: "incomplete",
    events: {
      status: ["RESOLVED", "INCOMPLETE"],
      comment: ["At this time we don't think there is enough information to move forward with this bug."]
    },
    keyboard: "2",
  },
  {
    text: "Works for me",
    id: "worksforme",
    events: {
      status: ["RESOLVED", "WORKSFORME"],
      comment: ["Unable to reproduce on platform listed, please re-open if issue persists."]
    },
    keyboard: "3",
  },
  {
    text: "Backlog",
    id: "backlog",
    events: {
      priority: ["P3"],
      status: ["NEW"],
    },
    keyboard: "4",
  },
  {
    text: "Feature req.",
    id: "featurerequest",
    events: {
      priority: ["P5", "enhancement"],
      status: ["NEW"],
    },
    keyboard: "5",
  },
  {
    text: "Priority one",
    id: "priorityone",
    events: {
      priority: ["P1"],
      flag: [
        ["FIREFOX_NIGHTLY", "affected"]
      ],
      status: ["NEW"],
    },
    keyboard: "6",
  },
  {
    text: "Accept patch",
    id: "acceptpatch",
    events: {
      priority: ["P5"],
      status: ["NEW"],
      comment: ["We'll accept a patch for this."]
    },
    keyboard: "7",
  },
  {
    text: "Defer",
    id: "defer",
    events: {
      priority: ["P2"],
      flag: [
        ["FIREFOX_NIGHTLY", "fix-optional"]
      ],
      status: ["NEW"]
    },
    keyboard: "8",
  },
  {
    text: "Canned",
    id: "canned",
    events: null,
    keyboard: "9"
  }
];
