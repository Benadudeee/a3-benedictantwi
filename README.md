## Your Web Application Title

Your Render (or alternative server) link e.g. https://a3-benedictantwi-production.up.railway.app/

### Application Goals
The goal was to make a slightly improved task list similar (if not identical) to A2 using mongodb for data storage and a different frontend approach to creating it. You simply add your tasks, it's due date and add it onto the tasks.

### Challenges
The hardest thing for me to implement was adding my CSS framework Tailwind locally. There was no clear documentation on how to add it onto express (unless we're counting the one from 2020) so I originally planned to add it as a cdn. But, I wanted to get 100% on all lighthouse scores for a technical achievement and the cdn tampered with my performance score, so I had to remove it. I had to use a new package postcss (which was a little tricky to work with) for compiling css from the tailwind package. Eventually (with a ton of MIME errors and renaming), I got that out of the way.

### Auth Strategy
I wanted to create my auth similar to the usual account creation experience. You first create an account (or login if you have one) and you can see the results of your tasks if you made any.

For Sign ups, you're prompt with a username, password which you have to enter again. The server will check if the username entered exists and if you entered the same password you used. If these are right, the program will take you to the dashboard.

For Login, you won't have an account created if the user doesn't exist, it will just tell you that your username is wrong. When you've entered the right credentials of an existing user, you also get logged into the dashboard.

When you're sucessfully authenticated, a session will save whether you're logged in and the userId created from the mongodb model the user schema references, this is used to get the tasks for a specific user.

You can also logout, which purges the userId and sets the login to false.

### Css Framework of Choice 
I used the framework I'm most familiar with, Tailwind. I like it for it's flexibility and ease of use.

### Middleware Packages
Here's a list of all my middleware packages

#### Static Views (express.static('views')) 

Used to render views so I can implement routing and use templating languages (.ejs)

### Public Views (express.static( path.join(__dirname, 'public')))

Used to render js and css files. Critical for configuring tailwind files

### Urlencoded : ( express.urlencoded({ extended:true })) 

Used to return form data which is used on all of my post requests


### Json ( express.json() )

Used to return json in routes. How my entire frontend is run for tasks

### Connection Test

Used to stop the program from running when the database cannot be accessed whether due to error or shutdown.

## Technical Achievements
- **Tech Achievement 1**: I used Railway instead of render. I used Railway a couple of times, so it was a more seamless familiar experience adding it then on render.

- **Tech Achievement 2**: I got 100% on ALL metrics on Lighthouse.

### Design/Evaluation Achievements
- **Design Achievement 1**: I followed the following tips from the W3C Web Accessibility Initiative

- (1) Write code that adapts to the users technology: I used tailwind breakpoints to ensure mobile responsiveness. (sm, indicates a smaller breakpoint)

- (2) Help users avoid and correct mistakes: When you logging in and signing up, if you enter an incorrect form value, the program tells you the issue. When creating tasks, if you don't fill in the due date and or name, the program tells you which one you need to input 

- (3) Associate a label for every form control: Added labels for input items on the login, signup, and main page

- (4) Identify page language and language changes: Added lang="en" inside the html for every page

- (5) Use markup to convey structre: Separated parts of the page with sections and headers. Used <nav> for navigation


