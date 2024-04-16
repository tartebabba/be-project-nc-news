# Northcoders News API

## Connecting local psql databases
In order to run this app with your local databases, you must provide the appropriate `.env` files for your databases respectively.

1. Use the './.env-example' file as an example for syntax.
2. Create a '.env.development' file for your development database and specify your database
  2a. *Example: `PGDATABASE=dev-database_name_here`
3. Create a '.env.test' file for your development database and specify your database
  3a. *Example: `PGDATABASE=test-database_name_here`
4. Add the two files to your '.gitignore' file.
```
// .gitignore
.env.test
.env.development

// Alternatively, you can use the below to ignore all .env files.
.env*
```

The 'connection.js' file will appropriately use the correct environment variables for testing.
Run the setup and seed scripts once this has been done in order to seed the data (*you will only see data in the development db at this stage.)