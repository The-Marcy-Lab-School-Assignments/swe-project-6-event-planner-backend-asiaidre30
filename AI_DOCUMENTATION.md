**1. What did you ask the AI to help you with, and why did you choose to use AI for that specific task?**

I used Claude to help me set up the structure of my Express server using MVC. I understood what the project was asking for and what each endpoint needed to do, but I was really confused about how to connect everything together, like pool.js, models, controllers, and index.js.

I asked something like the following:
“I have a project spec for an event planning backend. Can you help me set up an Express server using MVC with Express, pg, bcrypt, and cookie-session?”

I chose to use AI because I felt stuck on the setup part. I understood the concepts, but organizing all the files and wiring everything together from scratch was confusing. I didn’t want to stay stuck on boilerplate, so I used AI to help me get started so I could focus more on the actual logic.

**2. How did you evaluate whether the AI's output was correct or useful before using it?**

I didn’t just copy the code. I read through each file carefully and also ran the server to see what would happen.
Right away, I started noticing issues. For example, in one of the SQL queries it wrote VALUES (1$, 2$) instead of VALUES ($1, $2), which is invalid syntax. There was also a SELECT statement with an extra comma (SELECT user_id, username, FROM users) which would break the query.
Another issue was in a function where the parameter was named user_id but inside the function it used userId. I knew this would cause a ReferenceError when the code runs.
I also found a problem in the seed file where the indexing was off, so RSVPs would be connected to the wrong users or events.
I found these issues by both reading the code line by line and by running the server and looking at the errors.

**3. How did what the AI produced differ from what you ultimately used, and what does that tell you about your own understanding of the problem?**

I didn’t use the AI code exactly as it was. I fixed all the bugs I found and also changed some parts to match my setup.
For example, the AI used a DATABASE_URL connection string, but my local PostgreSQL setup uses separate environment variables like PGHOST, PGUSER, PGPASSWORD, PGDATABASE, and PGPORT. So I rewrote pool.js to work with my environment.
I also added my own comments throughout the code so I could actually understand and explain what each part does.
Another big difference was index.js. Mine started completely empty, so I had to figure out how everything connects and build that file myself instead of relying on AI.

**4. What did you learn from using AI in this way?**
I learned that AI is helpful for getting started, but it’s not always correct. It gave me code that looked right at first but actually had multiple small bugs that would have caused errors.
This made me realize that I still need to understand everything and not just trust the output.
I also learned that reading code carefully before running it can save a lot of time. Some of the bugs I caught just by reading would have taken longer to debug if I only relied on running the server.
Overall, I see AI more as a starting tool now, not something you can rely on completely.
