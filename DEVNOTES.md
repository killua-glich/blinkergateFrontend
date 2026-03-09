# DevNotes
for every note there is an emoji
❌ : for not done
✅ : for done 

# Dev Dockerfile ❌

needs rework something doesnt work 

if you can do this you will increase productivity by 100% 

you wont need to recompose the whole application for evry change

# "Blinker earned" badge functionality ✅
btn on click should uncomplete all quests and reset the status

if a quest is tagged as **single repeat** it should be deleted 

# change username doesnt change the username ❌
the current thing does not affect the username in the db so when you reload the page the name is like  before

what needs to be done is update the backend
 - User model add lvl, role, current xp
 - make an endpoint for updating username, role, current xp 

also current xp should be updated on every blinker to avoid spamming the quest completion

# Avatar selection ❌
on user creation the user can choose one of the available avatars.
the avatar can then be changed in the user page.
