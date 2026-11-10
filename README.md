# Sri Diggaj singh higher secondary School, Kalindipuram prayagraj— Website & Portal

A free-to-host starter project with:
- Public school profile website
- Responsive layout for phones and computers
- Staff login screen
- Exhibition/demo dashboard with fictional sample records
- Supabase database schema with Row Level Security (RLS) for a real deployment

## Important: demo vs real system

The **Exhibition Demo** uses fictional names and sample records stored in the browser code. It does not save actual attendance or connect to a school database.

The live login and database are **not active until configured**. This project is a starter implementation, not a certified school information system. Before entering real student/teacher information, the school principal/management must approve it, choose who is responsible for data, review applicable Indian privacy requirements, test permissions, and arrange backups.

## Files

- `index.html` — public website and staff portal layout
- `styles.css` — responsive visual design
- `app.js` — demo mode and Supabase sign-in integration
- `supabase/schema.sql` — database tables and row-level security policies

## Publish the public website for free with GitHub Pages

1. Create/sign in to a GitHub account.
2. Create a new repository, for example `school-website`.
3. Upload `index.html`, `styles.css`, `app.js`, and the `supabase` folder.
4. Open repository **Settings → Pages**.
5. Under Build and deployment, choose **Deploy from a branch**.
6. Choose branch `main` and folder `/ (root)`, then Save.
7. Wait for GitHub Pages to publish. The address will look like `https://YOUR-USERNAME.github.io/school-website/`.

GitHub Pages hosts the public static website for free. It does not run a private server by itself. The management login/database requires the Supabase setup below. Do not rely on hiding a page or button as security; database RLS policies are essential.

## Configure the live staff login and database

This setup should be done by the school’s authorized adult/IT administrator, not by publishing real records from a student account.

1. Create a Supabase project and keep the project owner account secure.
2. Open **SQL Editor** and run `supabase/schema.sql`.
3. In Supabase Authentication, create/invite approved staff accounts.
4. Copy each user's Auth UUID from the Supabase dashboard.
5. As project owner, create the staff profile and role using SQL, for example:

```sql
insert into public.profiles (id, display_name, role, active)
values ('AUTH-USER-UUID-HERE', 'Approved Principal', 'principal', true);
```

Allowed roles: `principal`, `management`, `teacher`. Do not let users choose their own role. Keep inactive accounts `active=false`.

6. For each teacher, create a matching `teachers` row and assign their profile UUID to the classes they teach:

```sql
insert into public.teachers (id, employee_code, subject)
values ('TEACHER-AUTH-UUID', 'T-001', 'Mathematics');

insert into public.school_classes (class_name, section, teacher_id)
values ('Class 9', 'A', 'TEACHER-AUTH-UUID');
```

7. In `app.js`, fill in `SUPABASE_URL` and `SUPABASE_ANON_KEY` using the project's public URL and publishable/anon key. The browser key is intended to be public; the `service_role` secret key must NEVER be placed in this project.
8. Test with separate test accounts: public visitor, teacher, management and principal. Verify that teachers cannot access another teacher's class, private teacher records, or management-only actions.
9. Add database-backed forms and reports before using it for daily school operations. The current live login is wired, while live attendance/student/teacher management screens still need their database CRUD integration.

## Security notes

- RLS is enabled for all tables in the supplied schema.
- Teacher student/attendance access is limited to classes assigned to their profile.
- Teacher private records are management-only.
- Public access is limited to school profile and published notices/events.
- Never upload real student lists, dates of birth, addresses, phone numbers, medical information, passwords or private teacher records to the public repository.
- Do not use real student names/photos in exhibition demo mode. Obtain school and guardian approvals for any public student photographs.
- Have a qualified administrator review the SQL policies and test them before real use.

## Free-plan notes

GitHub Pages and Supabase offer free tiers, but limits and terms can change. A custom domain, higher usage, backups or additional capacity may cost money. Free hosting is not a guarantee of unlimited service or enterprise-grade support.
