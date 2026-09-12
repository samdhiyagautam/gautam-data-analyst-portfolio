import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import "./enhancements.css";

const BackgroundField = lazy(() => import("./three/BackgroundField"));
const HeroOrbit = lazy(() => import("./three/HeroOrbit"));
import {
  ArrowUpRight,
  Download,
  Github,
  Linkedin,
  Mail,
  Menu,
  X,
  RefreshCw,
  Copy,
  Check,
  ChevronUp,
} from "lucide-react";

const API_URL =
  "https://gautam-data-analyst-portfolio.onrender.com/api/projects";

const fallbackProjects = [
  {
    id: "sales-analytics-automation",
    number: "01",
    title: "Sales Analytics & Automation System",
    status: "LIVE",
    type: "SQL • DASHBOARD • AUTOMATION",
    description:
      "End-to-end simulated e-commerce analytics project using PostgreSQL, SQL, Excel/Google Sheets and Google Apps Script automation.",
    skills: ["PostgreSQL", "SQL", "Excel", "Google Sheets", "Apps Script"],
    dashboard:
      "https://docs.google.com/spreadsheets/d/1LSBwi-Up503sTW-ACgDT7O3uTLTWZXlnKxnTLOVmsIA/edit?usp=sharing",
    github:
      "https://github.com/samdhiyagautam/sales-analytics-automation",
    metrics: [
      ["RECORDS", "3,000+"],
      ["REVENUE", "₹5.16Cr"],
      ["MARGIN", "32.2%"],
      ["AOV", "₹25.8K"],
    ],
  },
  {
    id: "python-data-cleaning",
    number: "02",
    title: "Python Data Cleaning & Automation",
    status: "COMING SOON",
    type: "PYTHON • PANDAS • AUTOMATION",
    description:
      "A reusable data-cleaning workflow for messy Excel/CSV files with automated quality checks and report generation.",
    skills: ["Python", "Pandas", "Data Cleaning", "Automation"],
  },
  {
    id: "power-bi-dashboard",
    number: "03",
    title: "Power BI Business Dashboard",
    status: "COMING SOON",
    type: "POWER BI • DAX • MODELING",
    description:
      "Interactive executive dashboard covering KPIs, trends, profitability, customer segments and drill-down analysis.",
    skills: ["Power BI", "DAX", "Data Modeling", "KPI Design"],
  },
  {
    id: "looker-studio",
    number: "04",
    title: "Looker Studio Analytics",
    status: "COMING SOON",
    type: "LOOKER STUDIO • REPORTING",
    description:
      "A browser-based analytics report with filters, scorecards and business-focused storytelling.",
    skills: ["Looker Studio", "Reporting", "Visualization"],
  },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [projects, setProjects] = useState(fallbackProjects);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      document.documentElement.style.setProperty("--mx", `${e.clientX}px`);
      document.documentElement.style.setProperty("--my", `${e.clientY}px`);
    };

    window.addEventListener("pointermove", onMove);

    return () => {
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  useEffect(() => {
    const ids = ["home", "about", "skills", "projects", "workflow", "contact"];
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: [0.1, 0.25, 0.5] }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSelectedProject(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);


  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const response = await fetch(API_URL, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        if (!cancelled && Array.isArray(data.projects)) {
          const normalized = data.projects.map((project, index) => ({
            ...project,
            number:
              project.number ||
              String(index + 1).padStart(2, "0"),
          }));

          setProjects(normalized);
          setApiOnline(true);
        }
      } catch (error) {
        console.error("Project API error:", error);

        if (!cancelled) {
          setApiOnline(false);
          setProjects(fallbackProjects);
        }
      } finally {
        if (!cancelled) {
          setLoadingProjects(false);
        }
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshProjects = async () => {
    setLoadingProjects(true);

    try {
      const response = await fetch(`${API_URL}?t=${Date.now()}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const data = await response.json();

      if (Array.isArray(data.projects)) {
        const normalized = data.projects.map((project, index) => ({
          ...project,
          number: project.number || String(index + 1).padStart(2, "0"),
        }));

        setProjects(normalized);
        setApiOnline(true);
      }
    } catch (error) {
      console.error("Project refresh error:", error);
      setApiOnline(false);
    } finally {
      setLoadingProjects(false);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("zaixaric2000@gmail.com");
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 1800);
    } catch (error) {
      console.error("Copy email failed:", error);
    }
  };

  const filteredProjects = useMemo(() => {
    if (filter === "All") return projects;

    return projects.filter((project) => {
      const searchable = [
        project.type || "",
        ...(project.skills || []),
        project.title || "",
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(filter.toLowerCase());
    });
  }, [filter, projects]);

  return (
    <div className="app">
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
      <div className="ambient" />
      <div className="grid-bg" />
      <Suspense fallback={null}>
        <BackgroundField />
      </Suspense>

      <header className="navbar">
        <a className="brand" href="#home">
          GAUTAM<span>.</span>
        </a>

        <nav className={`nav ${menuOpen ? "open" : ""}`}>
          {["about", "skills", "projects", "workflow", "contact"].map(
            (item) => (
              <a
                key={item}
                className={activeSection === item ? "nav-link active" : "nav-link"}
                href={`#${item}`}
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            )
          )}

          <a
            className="nav-mobile-cta"
            href="mailto:zaixaric2000@gmail.com"
          >
            Let&apos;s talk ↗
          </a>
        </nav>

        <a
          className="nav-cta"
          href="mailto:zaixaric2000@gmail.com"
        >
          Let&apos;s talk ↗
        </a>

        <button
          className="menu-btn"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <main>
        <section id="home" className="hero section-wrap">
          <div className="hero-copy reveal visible">
            <p className="eyebrow">
              DATA ANALYST • SQL • BI • AUTOMATION
            </p>

            <h1>
              Turning data into <span>clear decisions.</span>
            </h1>

            <p className="lead">
              I&apos;m Gautam, an aspiring Data Analyst focused on SQL,
              Excel, dashboards, reporting, business analysis and
              practical automation.
            </p>

            <div className="actions">
              <a className="btn primary" href="#projects">
                Explore projects <ArrowUpRight size={16} />
              </a>

             <a
  className="btn ghost"
  href="/gautam-data-analyst-portfolio/resume/Gautam_Data_Analyst_Resume.pdf"
  download
>
  Download resume <Download size={16} />
</a>
            </div>

            <div className="hero-highlights">
              <span><b>04</b> Projects</span>
              <span><b>01</b> Live system</span>
              <span><b>API</b> Connected</span>
            </div>

            <div className="social-row">
              <a
                href="https://github.com/samdhiyagautam"
                target="_blank"
                rel="noreferrer"
              >
                <Github size={15} />
                GitHub
              </a>

              <a
                href="https://www.linkedin.com/in/connectwithgautam"
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin size={15} />
                LinkedIn
              </a>

              <a href="mailto:zaixaric2000@gmail.com">
                <Mail size={15} />
                Email
              </a>
            </div>
          </div>

          <div className="hero-scene">
            <div className="orb green-orb" />
            <div className="orb red-orb" />

            <div className="tilt-card hero-card">
              <div className="availability">
                <span className="live-dot" />
                AVAILABLE FOR OPPORTUNITIES
              </div>

              <Suspense fallback={<div className="hero-orbit" aria-hidden="true" />}>
                <HeroOrbit />
              </Suspense>

              <div className="hero-card-foot">
                <div>
                  <small>FOCUS</small>
                  <strong>Analytics → Automation</strong>
                </div>

                <div>
                  <small>STACK</small>
                  <strong>SQL • Excel • Apps Script</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section-wrap section two-col">
          <div>
            <p className="eyebrow">ABOUT</p>

            <h2>
              Analytical mindset.
              <br />
              <span>Business-first output.</span>
            </h2>
          </div>

          <div className="copy">
            <p>
              I build portfolio projects around practical business
              questions instead of isolated tutorials. My goal is to
              connect data, analysis, visualization and communication
              into useful business output.
            </p>

            <p>
              My current focus is SQL, Excel/Google Sheets, BI
              dashboards, reporting and automation, with an emphasis
              on clear decisions and measurable outcomes.
            </p>
          </div>
        </section>

        <section id="skills" className="section-wrap section">
          <p className="eyebrow">SKILLS</p>

          <h2>
            Tools I&apos;m building <span>real-world depth in.</span>
          </h2>

          <div className="skill-grid">
            {[
              [
                "01",
                "SQL",
                "Joins, CTEs, window functions, aggregations and business queries.",
              ],
              [
                "02",
                "Excel",
                "Dashboards, formulas, pivots, cleaning and reporting.",
              ],
              [
                "03",
                "Power BI",
                "KPI design, DAX foundations and visual storytelling.",
              ],
              [
                "04",
                "Python",
                "Pandas, exploration, cleaning and analysis foundations.",
              ],
              [
                "05",
                "Apps Script",
                "Automated reports, scheduled workflows and repeatable processes.",
              ],
              [
                "06",
                "Git & GitHub",
                "Version control, documentation and portfolio publishing.",
              ],
            ].map(([no, title, text]) => (
              <article className="card" key={title}>
                <small>{no}</small>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className="section-wrap section">
          <div className="section-head">
            <div>
              <p className="eyebrow">PROJECT LAB</p>

              <h2>
                Work that proves <span>the skill.</span>
              </h2>

              <div className="api-status-row">
                <div className="api-status">
                  <span
                    className={
                      apiOnline ? "api-dot online" : "api-dot offline"
                    }
                  />
                  {loadingProjects
                    ? "Loading projects..."
                    : apiOnline
                    ? "Live API connected"
                    : "Offline fallback active"}
                </div>

                <button
                  className="api-refresh"
                  onClick={refreshProjects}
                  disabled={loadingProjects}
                  title="Refresh projects"
                  aria-label="Refresh projects"
                >
                  <RefreshCw
                    size={13}
                    className={loadingProjects ? "spin" : ""}
                  />
                  Refresh
                </button>
              </div>
            </div>

            <div className="filter-row">
              {["All", "SQL", "Python", "Power BI", "Looker"].map(
                (item) => (
                  <button
                    key={item}
                    className={
                      filter === item ? "filter active" : "filter"
                    }
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="project-grid">
            {filteredProjects.map((project) => (
              <article
                className={`project-card ${
                  project.id === "sales" ||
                  project.id === "sales-analytics-automation"
                    ? "featured"
                    : ""
                }`}
                key={project.id}
              >
                <div className="project-head">
                  <span className="project-no">
                    {project.number}
                  </span>

                  <span
                    className={
                      project.status === "LIVE"
                        ? "live-pill"
                        : "soon-pill"
                    }
                  >
                    {project.status}
                  </span>
                </div>

                <p className="project-type">
                  {project.type}
                </p>

                <h3>{project.title}</h3>

                <p className="project-desc">
                  {project.description}
                </p>

                <div className="tags">
                  {(project.skills || []).map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>

                {project.metrics && (
                  <div className="metric-grid">
                    {project.metrics.map(([label, value]) => (
                      <div key={label}>
                        <small>{label}</small>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                )}

                <div className="project-footer">
                  {project.dashboard && (
                    <div className="actions project-actions">
                      <a
                        className="btn primary"
                        href={project.dashboard}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Live dashboard ↗
                      </a>

                      {project.github && (
                        <a
                          className="btn ghost"
                          href={project.github}
                          target="_blank"
                          rel="noreferrer"
                        >
                          GitHub repo ↗
                        </a>
                      )}
                    </div>
                  )}

                 {project.id === "python-data-cleaning" ? (
  <a
    className="details-link"
    href="https://github.com/samdhiyagautam/gautam-data-analyst-portfolio/tree/main/projects/python-data-cleaning"
    target="_blank"
    rel="noreferrer"
  >
    View project <ArrowUpRight size={14} />
  </a>
) : (
  <button
    className="details-link"
    onClick={() => setSelectedProject(project)}
  >
    View details <ArrowUpRight size={14} />
  </button>
)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="stats section-wrap">
          {[
            ["1,999", "Delivered orders"],
            ["4,009", "Delivered units"],
            ["16.07%", "Return rate"],
            ["17.30%", "Cancellation rate"],
          ].map(([value, label]) => (
            <div key={label} className="stat">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section id="workflow" className="section-wrap section">
          <p className="eyebrow">HOW I WORK</p>

          <h2>
            From raw data to <span>useful insight.</span>
          </h2>

          <div className="workflow">
            {[
              ["01", "Collect", "SQL / Sheets / files"],
              ["02", "Clean", "Quality & consistency"],
              ["03", "Analyze", "KPIs & business questions"],
              ["04", "Visualize", "Dashboards & storytelling"],
              ["05", "Automate", "Repeatable reporting"],
            ].map(([no, title, text]) => (
              <div className="step" key={no}>
                <b>{no}</b>
                <strong>{title}</strong>
                <small>{text}</small>
              </div>
            ))}
          </div>
        </section>

        <section
          id="contact"
          className="section-wrap section contact"
        >
          <div>
            <p className="eyebrow">CONTACT</p>

            <h2>
              Let&apos;s build something{" "}
              <span>useful with data.</span>
            </h2>

            <p className="lead">
              Open to Data Analyst opportunities, projects and
              conversations around analytics, reporting and
              automation.
            </p>
          </div>

          <div className="contact-card">
            <small>GET IN TOUCH</small>

            <div className="contact-email-row">
              <a href="mailto:zaixaric2000@gmail.com">
                zaixaric2000@gmail.com ↗
              </a>
              <button
                className="copy-btn"
                onClick={copyEmail}
                aria-label="Copy email address"
                title="Copy email address"
              >
                {emailCopied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <a
              href="https://www.linkedin.com/in/connectwithgautam"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn Profile ↗
            </a>

            <a
              href="https://github.com/samdhiyagautam"
              target="_blank"
              rel="noreferrer"
            >
              GitHub Profile ↗
            </a>
          </div>
        </section>
      </main>

      {selectedProject && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="project-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedProject(null)}
              aria-label="Close project details"
            >
              <X size={18} />
            </button>

            <div className="modal-topline">
              <span className="project-no">{selectedProject.number}</span>
              <span
                className={
                  selectedProject.status === "LIVE"
                    ? "live-pill"
                    : "soon-pill"
                }
              >
                {selectedProject.status}
              </span>
            </div>

            <p className="project-type">{selectedProject.type}</p>
            <h3 id="project-modal-title">{selectedProject.title}</h3>
            <p className="modal-description">{selectedProject.description}</p>

            <div className="tags">
              {(selectedProject.skills || []).map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>

            {selectedProject.metrics && (
              <div className="metric-grid modal-metrics">
                {selectedProject.metrics.map(([label, value]) => (
                  <div key={label}>
                    <small>{label}</small>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions">
              {selectedProject.dashboard && (
                <a
                  className="btn primary"
                  href={selectedProject.dashboard}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open dashboard <ArrowUpRight size={15} />
                </a>
              )}

              {selectedProject.github && (
                <a
                  className="btn ghost"
                  href={selectedProject.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open GitHub <Github size={15} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        className="back-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        title="Back to top"
      >
        <ChevronUp size={17} />
      </button>

      <footer className="footer section-wrap">
        <span>© 2026 Gautam</span>
        <span>Data Analyst Portfolio</span>
      </footer>
    </div>
  );
}

export default App;
