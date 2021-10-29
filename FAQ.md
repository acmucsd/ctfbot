
# frequently asked questions

## why discord?
Fun experiment.

## what kind of Discord rate limits cause problems for ctfbot?

Glad you asked!! The answer is *a lot of them*.
Here's a highlight of the few that make me the most angry:

- only 250 roles in a server / created per guild *every 24 hours*
- only 500 channels in a server, period
- only 5 channel renames / topic sets per 20 minutes
- only 50 channels per channel category

These limits have had far reaching effects on the structure and implementation of ctfbot,
which only barely works around these.