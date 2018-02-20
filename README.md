This is work in progress, but might work for some people.

The goal of Bugzilla Triage Helper is to provide an easy and standard interface to triaging bugs across the Firefox organization within Mozilla. This is in an early stage, we are giving it a try and looking for feedback.

## Configuration

Click the browser action button (its a question mark in a blue circle) and go to the configuration page. Enter your email address. The tool will then automatically get the query to triage from Bugzilla based on that email address. Click update.

To return to the configuration page later, go to `about:addons` > `Bugzilla Triage Helper` > `Preferences`.

### Configuration options

* `Your email`: if you enter your Bugzilla email address then the extension will query Bugzilla to find how many bugs you are the triage owner for. In a minute you'll notice that the count on the browser action will have changed from 0 to the number of bugs you have to triage. In an attempt not to spam Bugzilla, this number is checked every couple of minutes (we might need to change that).

* `Submit form automatically?`: this will submit the bug changes automatically as soon as you choose an action. It's suggested you get comfortable with triaging before using this.

* `Add to cc?`: by default, Bugzilla will do whatever you've configured Bugzilla to do with the cc field. You can change this field to automatically cc yourself on every bug, or not.

## Triaging

Click on the browser action button to go to your traige list. Proceed through the bugs as normal but notice there's a panel at the top right that gives you some options. These will alter the bug for you.

Each action can also be done through a keyboard shortcut, noted on the right of each action.

For each action you can extend it for your product and component in Bugzilla, by altering the `additional.js` file in this repository. Note: currently you can only extend the actions, not alter their core behaviour. This allows triage owners to add their own workflow to each component without changing the overall goal of having a consistent flow.

Please send in your pull requests to configure this extension so that it works for you.

### Adding additional actions

`additional.js` builds on top of `actions.js` by allowing you to add additional actions to each of the base actions. It looks up a key in the `additionalEvents` object based on a key which is `Bugzilla Product|Bugzilla Component|Action Id`. For example: `Firefox|Untriaged|canned` would be a key for the canned action on the `Firefox: Untriaged` component.

The actions then mirror the entry in `actions.js`, such as `comment` or `whiteboard`. Here's an example to add the `whiteboard` entry "[triaged]" to the P5, Accept Patch for `Firefox: Sync`:

```
"Firefox|Sync|acceptpatch": {
    whiteboard: ["[triaged]"],
}
```

There can be multiple additional actions for an action, if there are, a second menu is shown so the user can choose them.

*Note:* the actions do not update if you change a product or component until you reload the page.

### Available actions

* `blocks`: adds in a blocking bug.
* `comment`: adds in a comment.
* `flag`: sets a Firefox flag eg: `["FIREFOX_NIGHTLY", "affected"]`. All the choices of flags can be seen at the bottom of the configuration page.
* `priority`: sets the bug priority.
* `status`: sets the bug status. This won't override a status already set, if its "lower". Eg: won't set a `NEW` bug to `UNCONFIRMED`.
* `whiteboard`: adds in a whiteboard entry if it doesn't already exist.

In the code, but not normally added as an additional action:

* `cc`: changes the cc based on the user preference.
* `submit`: submits the form, will be called automatically based on the user preference.

## Feedback, bugs, patches

Please use github for this: https://github.com/andymckay/bugzilla-triage-helper/issues/
