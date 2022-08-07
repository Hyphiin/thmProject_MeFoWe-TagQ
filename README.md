# MeFoWe-Wireframe

## Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/ee/gitlab-basics/add-file.html#add-a-file-using-the-command-line) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://git.thm.de/fwgn02/mefowe-wireframe.git
git branch -M master
git push -uf origin master
```

## Connect Repo with OpenAI

1. Open the following link https://openai.com/api/ and create a new Account if not already done.

2. Sign in to your existing Account.

3. After that, go to your Account settings https://beta.openai.com/account/usage

4. Navigate to the bulletpoint "API Keys"

5. If not already done, create a new secret key and copy it.

6. Now go back to your project and open following File: /src/openAi/openAi.ts

7. Now overwrite the existing Api-Key with your newly created one.

## Name

Tag-Q

## Description

The following Software aims to help learning HTML and CSS by undergoing a interactive Quiz.

## Authors and acknowledgment

Chiara Knipprath, Felix Wegener, Nils Friedrich
