# Jenkins CI/CD Setup Guide

This project includes a **Jenkinsfile** so you can run a CI/CD pipeline and learn how it works.

## What the pipeline does

| Stage | What it does |
|-------|----------------|
| **Checkout** | Clones the repo (or pulls the branch) into the workspace |
| **Install** | Runs `npm ci` to install dependencies from `package-lock.json` |
| **Validate** | Runs `npm run validate` to check project structure and `package.json` |
| **Docker Build** | Builds the app image with `docker build -t expense-application:<build#>` (skipped on non-Unix agents) |

On success, you get a clean run; on failure, the build fails at the first failed stage so you can fix it.

---

## 1. Install Jenkins

### Option A: Run Jenkins with Docker (easiest for learning)

```bash
docker run -d --name jenkins -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
```

Get the initial admin password:

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Open **http://localhost:8080**, paste the password, complete the setup wizard, and install the suggested plugins.

### Option B: Run Jenkins on your machine

- **macOS (Homebrew):** `brew install jenkins-lts` then `brew services start jenkins-lts`
- **Linux:** use your distro’s package manager or the [official install guide](https://www.jenkins.io/doc/book/installing/)

Then open **http://localhost:8080** (or the port Jenkins shows) and complete the setup wizard.

---

## 2. Prepare the Jenkins agent (where the job runs)

The pipeline needs **Node.js** and **npm** on the agent that runs the job (often the same machine as Jenkins).

- If Jenkins runs in Docker, use an image that has Node (e.g. `node:18`) or install Node inside the container.
- If Jenkins runs on the host, install Node 18+ and npm on that machine.

For the **Docker Build** stage, the agent also needs **Docker** (and the Jenkins process must be allowed to use it). If you don’t have Docker, you can comment out or remove the **Docker Build** stage in the `Jenkinsfile`; the rest of the pipeline will still run.

---

## 3. Create a Pipeline job and connect GitHub

1. In Jenkins: **New Item** → name (e.g. `Expense-Application`) → **Pipeline** → **OK**.
2. Under **Pipeline**:
   - **Definition:** “Pipeline script from SCM”
   - **SCM:** Git
   - **Repository URL:** `https://github.com/Arivu-007/Expense-Application.git`
   - **Branch:** `*/main` (or the branch you want to build)
   - **Script Path:** `Jenkinsfile`
3. Save.

If the repo is **private**, add credentials:

- **Manage Jenkins** → **Credentials** → **Add** → **Username and password** (GitHub user + Personal Access Token) or **SSH key**.
- In the job’s Pipeline section, under **Repositories**, choose that credential.

---

## 4. Run the pipeline

- Click **Build Now**.
- Open the run (e.g. **#1**) and click **Console Output** to see each stage (Checkout → Install → Validate → Docker Build) and any errors.

---

## 5. Trigger builds from GitHub (optional)

To run the pipeline on every push or PR:

1. Install the **GitHub** (or **GitHub Plugin**) and **Pipeline: GitHub** plugins if needed.
2. In the job: **Configure** → **Build Triggers** → enable **GitHub hook trigger for GITScm polling**.
3. In GitHub: repo **Settings** → **Webhooks** → **Add webhook**:
   - **Payload URL:** `https://<your-jenkins-host>/github-webhook/`
   - **Content type:** application/json
   - **Events:** Just the push event (or “Send me everything” for learning)
4. Save. Pushes to the branch you configured will trigger the pipeline.

---

## Quick reference

- **Jenkinsfile** in the repo root defines the pipeline (stages and steps).
- **scripts/validate.js** is run by `npm run validate` in the **Validate** stage.
- To add more stages (e.g. tests, deploy), edit the **Jenkinsfile** and add new `stage('...') { ... }` blocks.

For more: [Jenkins Pipeline docs](https://www.jenkins.io/doc/book/pipeline/).
