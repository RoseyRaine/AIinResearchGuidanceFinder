# AI in Research Decision Tool

A static, accessible decision-support website designed for GitHub Pages and embedding in Springshare LibGuides.

## What is included

- Guided decision pathway
- Searchable controlled FAQ answers
- Topic browsing
- Four indicative outcomes:
  - Generally acceptable
  - Use with caution
  - Approval or advice required
  - Do not proceed
- Print-friendly answer pages
- Mobile-responsive layout
- No database, API key, chatbot or collection of user questions

## Important status

This resource is based on the 2026 draft *Artificial Intelligence in Research: Guidance for Responsible Use*. All wording, support pathways, branding, links and governance statements should be reviewed and formally approved before publication.

## Test locally

Because the site loads JSON files, do not open `index.html` by double-clicking it. Run a small local web server from the project folder:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Publish with GitHub Pages

1. Create a new GitHub repository, for example `ai-research-guidance`.
2. Upload all files and folders in this project.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose the `main` branch and `/ (root)` folder.
6. Save. GitHub will provide a URL similar to:

```text
https://YOUR-USERNAME.github.io/ai-research-guidance/
```

## Embed in LibGuides

Add the following to an HTML-enabled LibGuides box after replacing the URL:

```html
<div style="width:100%; min-height:900px;">
  <iframe
    src="https://YOUR-USERNAME.github.io/ai-research-guidance/"
    title="AI in Research Decision Tool"
    width="100%"
    height="900"
    loading="lazy"
    style="border:0; width:100%;">
  </iframe>
</div>
```

Ask the Springshare administrator to confirm whether the GitHub Pages domain is permitted in iframes and the institutional Content Security Policy.

## Update the controlled answers

Edit `data/questions.json`. Each question contains:

- `id`
- `title`
- `category`
- `keywords`
- `status`
- `answer`
- `why`
- `actions`
- `recording`
- `sections`
- `support`

Valid status values are:

```text
acceptable
caution
approval
prohibited
```

## Update the guided pathway

Edit `data/pathways.json`.

- Decision nodes contain a `question` and `options`.
- Each option points to another node with `next` or to an outcome with `result`.
- Outcome wording is stored under `results`.

## Recommended pre-publication checks

- Confirm official CSU branding and accessibility requirements.
- Replace generic support names with approved service names and links.
- Review legal, privacy, ethics and copyright wording.
- Confirm current ARC, NHMRC and publisher statements.
- Conduct keyboard, screen-reader and mobile testing.
- Add an approved privacy statement and analytics only if required.
- Establish a content owner, approval process, version number and review schedule.


## Brand note
This resource uses the approved Charles Sturt colour values and Arial as the approved system substitute for Basis Grotesque. Use only approved Charles Sturt University logo artwork supplied by the Brand and Performance Marketing team; do not redraw or alter the official logo.


## Related tool

The decision tool links contextually to the CSU Library **Can I upload this to an AI tool?** checker:

https://roseyraine.github.io/ai-upload-check/

The upload checker provides a quick first check on copyright and platform terms; it does not replace ethics, privacy, confidentiality, contractual or data-governance requirements.


## Case studies

`case-studies.html` presents the ten examples from Appendix E as filterable, expandable cards with links to the relevant guidance sections.


## Additional pages in v0.6.0
- `recommendations.html` — concise interactive overview of the nine recommendations.
- `declarations.html` — adaptable declaration/acknowledgement wording from Appendix C with copy buttons.
- `case-studies.html` — now includes all 14 case studies from Appendix E.
