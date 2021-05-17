
# guidelines

## contributing issues
The issue tracker is the preferred channel for [bug reports](#bug-reports),
[features requests](#feature-requests) and [submitting pull requests](#pull-requests),
but please standard rules apply:

* Please **do not** use the issue tracker for personal support requests (use
  [Stack Overflow](http://stackoverflow.com)).

* Please **do not** derail or troll issues. Keep the discussion on topic and
  respect the opinions of others.

Also, you should check out our [FAQ](FAQ.md) if you have a question about the project.

## bug reports

A bug is a _demonstrable problem_ that is caused by the code in the repository.
Good bug reports are extremely helpful - thank you!

Guidelines for bug reports:

1. **Use the GitHub issue search** &mdash; check if the issue has already been
   reported.

2. **Check if the issue has been fixed** &mdash; try to reproduce it using the
   latest `master` or development branch in the repository.

3. **Isolate the problem** &mdash; create a [reduced test
   case](http://css-tricks.com/reduced-test-cases/).

A good bug report shouldn't leave others needing to chase you up for more
information. Please try to be as detailed as possible in your report. What is
your environment? What steps will reproduce the issue? What would you expect to be the outcome?
All these details will help us to fix any potential bugs.

**Example:**

> Short and descriptive example bug report title
>
> A summary of the issue and the environment in which it occurs. If
> suitable, include the steps required to reproduce the bug.
>
> 1. This is the first step
> 2. This is the second step
> 3. Further steps, etc.
>
> Maybe an image attachment of the bug, if visual.
> 
> Any other information you want to share that is relevant to the issue being
> reported. This might include the lines of code that you have identified as
> causing the bug, and potential solutions (and your opinions on their
> merits).


## feature requests

Feature requests are welcome. Simply [create an issue](https://github.com/acmucsd/ctfbot/issues/new) with the `enhancement` tag. But, take a moment to find out whether your idea
fits with the scope and aims of the ctfbot project. It's up to *you* to make a strong
case to convince us of the merits of this feature. Please
provide as much detail and context as possible.



## pull requests

Good pull requests - patches, improvements, new features - are a fantastic
help. They should remain focused in scope and avoid containing unrelated
commits.

**Please ask first** before embarking on any significant pull request (e.g.
implementing features, refactoring code),
otherwise you risk spending a lot of time working on something that the
project's developers might not want to merge into the project.

Please adhere to the coding conventions used throughout a project (indentation,
accurate comments, etc). We also use ESLint and Prettier, which should be used before committing.

Follow this process if you'd like your work considered for inclusion in the
project:

1. [Fork](http://help.github.com/fork-a-repo/) the project, clone your fork,
   and configure the remotes:

   ```bash
   # Clone your fork of the repo into the current directory
   git clone https://github.com/<your-username>/ctfbot
   # Navigate to the newly cloned directory
   cd ctfbot
   # Assign the original repo to a remote called "upstream"
   git remote add upstream https://github.com/acmucsd/ctfbot
   ```

2. If you cloned a while ago, get the latest changes from upstream:

   ```bash
   git checkout main
   git pull upstream main
   ```

3. Create a new topic branch (off the main project development branch) to
   contain your feature, change, or fix:

   ```bash
   git checkout -b <topic-branch-name>
   ```

4. Commit your changes in logical chunks. Please adhere to these [git commit
   message guidelines](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)
   or your code is unlikely be merged into the main project. Use Git's
   [interactive rebase](https://help.github.com/articles/interactive-rebase)
   feature to tidy up your commits before making them public.

5. Locally merge (or rebase) the upstream development branch into your topic branch:

   ```bash
   git pull [--rebase] upstream <dev-branch>
   ```

6. Push your topic branch up to your fork:

   ```bash
   git push origin <topic-branch-name>
   ```

7. [Open a Pull Request](https://help.github.com/articles/using-pull-requests/)
   with a clear title and description.

**IMPORTANT**: By submitting a patch, you agree to allow ACM at UC San Diego to
license your work under the MIT licence.

### running the project for development

Currently, if you want to run the project in development mode (to see changes live), you'll need to run it outside of docker.

You'll still need all the Discord bot token stuff from the [README](./README.md).

You can spin up a dev postgres server that the development version can connect to with **no configuration**
with the following command:

```bash
docker run --name ctfbot-postgres -p 5432:5432 -e POSTGRES_PASSWORD=dAf1bjOwYUrVse8DsAZZBh2fkxXQwAbGrmE7EHUA -e POSTGRES_USER=ctfbot -d postgres
```

From here, you'll need [node-gyp installed](https://github.com/nodejs/node-gyp#installation) and all the build tools to compile native bindings.

Lastly, to clone the project, build the dependencies, compile the code, and execute:

```bash
git clone https://github.com/acmucsd/ctfbot.git
npm install # may require postgres to be installed
npm start # run development mode, changes trigger a reload
```