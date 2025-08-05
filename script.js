class JobBoard {
  constructor() {
    this.jobs = [];
    this.currentQuery = "";
    this.selectedJob = null;
    this.currentFilters = [];
    this.currentLocation = "";

    // Default filter values
    this.filters = {
      employmentTypes: ["fulltime", "parttime", "intern", "contractor"],
      remoteOnly: false,
      autoTranslateLocation: true,
      experienceLevels: [],
      minSalary: null,
      maxSalary: null,
      benefits: [],
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadJobs();
  }

  bindEvents() {
    // Search functionality
    document.getElementById("searchInput").addEventListener(
      "input",
      this.debounce((e) => {
        this.currentQuery = e.target.value || "";
        this.loadJobs();
      }, 500)
    );

    // Location filter
    document
      .getElementById("locationSelect")
      .addEventListener("change", (e) => {
        this.currentLocation = e.target.value || "";
        this.loadJobs();
      });

    // Filters panel toggle
    document.getElementById("filtersBtn").addEventListener("click", () => {
      this.toggleFiltersPanel();
    });

    document.getElementById("closeFilters").addEventListener("click", () => {
      this.closeFiltersPanel();
    });

    // Filter panel overlay
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("filters-overlay")) {
        this.closeFiltersPanel();
      }
    });

    // Employment type filters
    const employmentCheckboxes = document.querySelectorAll(
      'input[type="checkbox"][id="fulltime"], input[type="checkbox"][id="parttime"], input[type="checkbox"][id="intern"], input[type="checkbox"][id="contractor"]'
    );
    employmentCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        this.updateEmploymentTypes();
      });
    });

    // Remote options
    const remoteRadios = document.querySelectorAll('input[name="remoteOnly"]');
    remoteRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        this.filters.remoteOnly = radio.value === "true";
        this.updateFilterCount();
      });
    });

    // Auto-translate location
    document
      .getElementById("autoTranslateLocation")
      .addEventListener("change", (e) => {
        this.filters.autoTranslateLocation = e.target.checked;
        this.updateFilterCount();
      });

    // Experience level filters
    const experienceCheckboxes = document.querySelectorAll(
      'input[type="checkbox"][id="entry"], input[type="checkbox"][id="mid"], input[type="checkbox"][id="senior"], input[type="checkbox"][id="executive"]'
    );
    experienceCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        this.updateExperienceLevels();
      });
    });

    // Salary range
    document.getElementById("minSalary").addEventListener("input", (e) => {
      this.filters.minSalary = e.target.value ? parseInt(e.target.value) : null;
      this.updateFilterCount();
    });

    document.getElementById("maxSalary").addEventListener("input", (e) => {
      this.filters.maxSalary = e.target.value ? parseInt(e.target.value) : null;
      this.updateFilterCount();
    });

    // Benefits filters
    const benefitCheckboxes = document.querySelectorAll(
      'input[type="checkbox"][id="healthInsurance"], input[type="checkbox"][id="dentalInsurance"], input[type="checkbox"][id="visionInsurance"], input[type="checkbox"][id="retirementPlan"], input[type="checkbox"][id="paidTimeOff"]'
    );
    benefitCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        this.updateBenefits();
      });
    });

    // Filter actions
    document.getElementById("applyFilters").addEventListener("click", () => {
      this.closeFiltersPanel();
      this.loadJobs();
    });

    document.getElementById("resetFilters").addEventListener("click", () => {
      this.resetFilters();
    });

    // Filter removal
    document.getElementById("filterTags").addEventListener("click", (e) => {
      if (e.target.classList.contains("remove")) {
        const filter = e.target.dataset.filter;
        this.removeFilter(filter);
      }
    });

    // Clear all filters
    document.getElementById("clearAll").addEventListener("click", (e) => {
      e.preventDefault();
      this.clearAllFilters();
    });

    // Sort functionality
    document.getElementById("sortSelect").addEventListener("change", (e) => {
      this.sortJobs(e.target.value);
    });

    // Modal functionality
    document.getElementById("modalOverlay").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) {
        this.closeModal();
      }
    });

    document.getElementById("modalClose").addEventListener("click", () => {
      this.closeModal();
    });

    // Job card clicks
    document.getElementById("jobsList").addEventListener("click", (e) => {
      const jobCard = e.target.closest(".job-card");
      if (jobCard) {
        const jobId = jobCard.dataset.jobId;
        this.openJobModal(jobId);
      }
    });

    // Escape key to close modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal();
        this.closeFiltersPanel();
      }
    });
  }

  toggleFiltersPanel() {
    const panel = document.getElementById("filtersPanel");
    const overlay =
      document.querySelector(".filters-overlay") || this.createFiltersOverlay();

    panel.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeFiltersPanel() {
    const panel = document.getElementById("filtersPanel");
    const overlay = document.querySelector(".filters-overlay");

    panel.classList.remove("active");
    if (overlay) {
      overlay.classList.remove("active");
    }
    document.body.style.overflow = "";
  }

  createFiltersOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "filters-overlay";
    document.body.appendChild(overlay);
    return overlay;
  }

  updateEmploymentTypes() {
    const employmentTypes = [];
    const checkboxes = document.querySelectorAll(
      'input[type="checkbox"][id="fulltime"], input[type="checkbox"][id="parttime"], input[type="checkbox"][id="intern"], input[type="checkbox"][id="contractor"]'
    );

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        employmentTypes.push(checkbox.value);
      }
    });

    this.filters.employmentTypes = employmentTypes;
    this.updateFilterCount();
  }

  updateExperienceLevels() {
    const experienceLevels = [];
    const checkboxes = document.querySelectorAll(
      'input[type="checkbox"][id="entry"], input[type="checkbox"][id="mid"], input[type="checkbox"][id="senior"], input[type="checkbox"][id="executive"]'
    );

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        experienceLevels.push(checkbox.value);
      }
    });

    this.filters.experienceLevels = experienceLevels;
    this.updateFilterCount();
  }

  updateBenefits() {
    const benefits = [];
    const checkboxes = document.querySelectorAll(
      'input[type="checkbox"][id="healthInsurance"], input[type="checkbox"][id="dentalInsurance"], input[type="checkbox"][id="visionInsurance"], input[type="checkbox"][id="retirementPlan"], input[type="checkbox"][id="paidTimeOff"]'
    );

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        benefits.push(checkbox.id);
      }
    });

    this.filters.benefits = benefits;
    this.updateFilterCount();
  }

  updateFilterCount() {
    let count = 0;

    // Count non-default employment types
    if (this.filters.employmentTypes.length !== 4) {
      count += 1;
    }

    // Count remote only
    if (this.filters.remoteOnly) {
      count += 1;
    }

    // Count auto-translate location
    if (!this.filters.autoTranslateLocation) {
      count += 1;
    }

    // Count experience levels
    count += this.filters.experienceLevels.length;

    // Count salary range
    if (this.filters.minSalary || this.filters.maxSalary) {
      count += 1;
    }

    // Count benefits
    count += this.filters.benefits.length;

    document.getElementById("filterCount").textContent = count;
    this.updateFilterTags();
  }

  updateFilterTags() {
    const filterTags = document.getElementById("filterTags");
    const tags = [];

    // Employment types
    if (this.filters.employmentTypes.length !== 4) {
      const selectedTypes = this.filters.employmentTypes.map(
        (type) => type.charAt(0).toUpperCase() + type.slice(1)
      );
      tags.push(
        `<div class="filter-tag">Employment: ${selectedTypes.join(
          ", "
        )} <span class="remove" data-filter="employment">×</span></div>`
      );
    }

    // Remote only
    if (this.filters.remoteOnly) {
      tags.push(
        `<div class="filter-tag">Remote Only <span class="remove" data-filter="remote">×</span></div>`
      );
    }

    // Experience levels
    if (this.filters.experienceLevels.length > 0) {
      const levels = this.filters.experienceLevels.map(
        (level) => level.charAt(0).toUpperCase() + level.slice(1)
      );
      tags.push(
        `<div class="filter-tag">Experience: ${levels.join(
          ", "
        )} <span class="remove" data-filter="experience">×</span></div>`
      );
    }

    // Salary range
    if (this.filters.minSalary || this.filters.maxSalary) {
      let salaryText = "Salary: ";
      if (this.filters.minSalary && this.filters.maxSalary) {
        salaryText += `$${this.filters.minSalary.toLocaleString()} - $${this.filters.maxSalary.toLocaleString()}`;
      } else if (this.filters.minSalary) {
        salaryText += `$${this.filters.minSalary.toLocaleString()}+`;
      } else {
        salaryText += `Up to $${this.filters.maxSalary.toLocaleString()}`;
      }
      tags.push(
        `<div class="filter-tag">${salaryText} <span class="remove" data-filter="salary">×</span></div>`
      );
    }

    // Benefits
    if (this.filters.benefits.length > 0) {
      const benefitNames = this.filters.benefits.map((benefit) =>
        benefit
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
      );
      tags.push(
        `<div class="filter-tag">Benefits: ${benefitNames.join(
          ", "
        )} <span class="remove" data-filter="benefits">×</span></div>`
      );
    }

    if (tags.length === 0) {
      filterTags.innerHTML =
        '<a href="#" class="clear-all" id="clearAll">Clear All</a>';
    } else {
      filterTags.innerHTML =
        tags.join("") +
        '<a href="#" class="clear-all" id="clearAll">Clear All</a>';
    }
  }

  removeFilter(filterType) {
    switch (filterType) {
      case "employment":
        this.filters.employmentTypes = [
          "fulltime",
          "parttime",
          "intern",
          "contractor",
        ];
        this.resetEmploymentCheckboxes();
        break;
      case "remote":
        this.filters.remoteOnly = false;
        document.getElementById("remoteAny").checked = true;
        break;
      case "experience":
        this.filters.experienceLevels = [];
        this.resetExperienceCheckboxes();
        break;
      case "salary":
        this.filters.minSalary = null;
        this.filters.maxSalary = null;
        document.getElementById("minSalary").value = "";
        document.getElementById("maxSalary").value = "";
        break;
      case "benefits":
        this.filters.benefits = [];
        this.resetBenefitCheckboxes();
        break;
    }
    this.updateFilterCount();
    this.loadJobs();
  }

  resetEmploymentCheckboxes() {
    document.getElementById("fulltime").checked = true;
    document.getElementById("parttime").checked = true;
    document.getElementById("intern").checked = true;
    document.getElementById("contractor").checked = true;
  }

  resetExperienceCheckboxes() {
    document.getElementById("entry").checked = false;
    document.getElementById("mid").checked = false;
    document.getElementById("senior").checked = false;
    document.getElementById("executive").checked = false;
  }

  resetBenefitCheckboxes() {
    document.getElementById("healthInsurance").checked = false;
    document.getElementById("dentalInsurance").checked = false;
    document.getElementById("visionInsurance").checked = false;
    document.getElementById("retirementPlan").checked = false;
    document.getElementById("paidTimeOff").checked = false;
  }

  resetFilters() {
    this.filters = {
      employmentTypes: ["fulltime", "parttime", "intern", "contractor"],
      remoteOnly: false,
      autoTranslateLocation: true,
      experienceLevels: [],
      minSalary: null,
      maxSalary: null,
      benefits: [],
    };

    this.resetEmploymentCheckboxes();
    document.getElementById("remoteAny").checked = true;
    document.getElementById("autoTranslateLocation").checked = true;
    this.resetExperienceCheckboxes();
    document.getElementById("minSalary").value = "";
    document.getElementById("maxSalary").value = "";
    this.resetBenefitCheckboxes();

    this.updateFilterCount();
  }

  clearAllFilters() {
    this.resetFilters();
    this.loadJobs();
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  async loadJobs() {
    this.showLoading();

    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (this.currentQuery) {
        params.append("query", this.currentQuery);
      } else {
        // If no query is provided, use a default search term
        params.append("query", "jobs");
      }

      // API requires either location or nextPage parameter
      if (this.currentLocation && this.currentLocation !== "anywhere") {
        params.append("location", this.currentLocation);
      } else {
        // If no location is selected or "anywhere" is selected, use "anywhere"
        params.append("location", "anywhere");
      }

      // Ensure we have at least one employment type selected
      if (this.filters.employmentTypes.length === 0) {
        params.append("employmentTypes", "fulltime");
      }

      params.append(
        "autoTranslateLocation",
        this.filters.autoTranslateLocation.toString()
      );
      params.append("remoteOnly", this.filters.remoteOnly.toString());

      if (this.filters.employmentTypes.length > 0) {
        params.append(
          "employmentTypes",
          this.filters.employmentTypes.join(";")
        );
      }

      if (this.filters.experienceLevels.length > 0) {
        params.append(
          "experienceLevels",
          this.filters.experienceLevels.join(";")
        );
      }

      if (this.filters.minSalary) {
        params.append("minSalary", this.filters.minSalary.toString());
      }

      if (this.filters.maxSalary) {
        params.append("maxSalary", this.filters.maxSalary.toString());
      }

      if (this.filters.benefits.length > 0) {
        params.append("benefits", this.filters.benefits.join(";"));
      }

      const url = `https://jobs-api14.p.rapidapi.com/v2/list?${params.toString()}`;
      console.log("API URL:", url);
      console.log("Parameters:", params.toString());

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key":
            "f4e3314567msh41c1041878b3d52p19e0abjsn19006174e7b4",
          "x-rapidapi-host": "jobs-api14.p.rapidapi.com",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `Failed to fetch jobs: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      this.jobs = data.jobs || [];
      this.renderJobs();
      this.hideLoading();
    } catch (error) {
      console.error("Error loading jobs:", error);
      this.showError();
    }
  }

  showLoading() {
    document.getElementById("loadingState").style.display = "block";
    document.getElementById("errorState").style.display = "none";
    document.getElementById("jobsList").style.display = "none";
  }

  hideLoading() {
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("jobsList").style.display = "block";
  }

  showError() {
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("errorState").style.display = "block";
    document.getElementById("jobsList").style.display = "none";
  }

  renderJobs() {
    const jobsList = document.getElementById("jobsList");
    const jobCount = document.getElementById("jobCount");

    jobCount.textContent = this.jobs.length;

    if (this.jobs.length === 0) {
      jobsList.innerHTML =
        '<div class="no-jobs">No jobs found. Try adjusting your search criteria.</div>';
      return;
    }

    jobsList.innerHTML = this.jobs
      .map((job, index) => {
        const companyInitial = job.company.charAt(0).toUpperCase();
        const logoColor = this.getCompanyColor(job.company);
        const employmentTag = this.getEmploymentTag(job.employmentType);
        const salary = job.salaryRange || "Competitive salary";

        return `
                    <div class="job-card" data-job-id="${job.id}">
                        <div class="job-logo" style="background: ${logoColor}">
                            ${companyInitial}
                        </div>
                        <div class="job-info">
                            <div class="job-title">${job.title}</div>
                            <div class="job-company">${job.company} — ${
          job.location
        }</div>
                            <div class="job-tags">
                                ${employmentTag}
                                ${this.getSkillTags(job.title)}
                            </div>
                        </div>
                        <div class="job-details">
                            <div class="job-salary">${salary}</div>
                            <div class="job-time">${job.timeAgoPosted}</div>
                        </div>
                    </div>
                `;
      })
      .join("");
  }

  getCompanyColor(company) {
    const colors = [
      "#6366f1",
      "#8b5cf6",
      "#ec4899",
      "#ef4444",
      "#f59e0b",
      "#10b981",
      "#06b6d4",
      "#6366f1",
    ];
    const hash = company
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  getEmploymentTag(employmentType) {
    if (!employmentType) return "";

    if (
      employmentType.toLowerCase().includes("remote") ||
      employmentType.toLowerCase().includes("anywhere")
    ) {
      return '<span class="job-tag remote">Remote</span>';
    }
    return '<span class="job-tag remote">Remote</span>';
  }

  getSkillTags(title) {
    const skills = [];
    const titleLower = title.toLowerCase();

    if (titleLower.includes("javascript") || titleLower.includes("js")) {
      skills.push('<span class="job-tag skill">JavaScript</span>');
    }
    if (titleLower.includes("react")) {
      skills.push('<span class="job-tag skill">React</span>');
    }
    if (titleLower.includes("ux") || titleLower.includes("ui")) {
      skills.push('<span class="job-tag skill">UX/UI</span>');
    }
    if (titleLower.includes("design")) {
      skills.push('<span class="job-tag adobe">Design</span>');
    }

    return skills.join("");
  }

  openJobModal(jobId) {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) return;

    this.selectedJob = job;
    this.renderModal(job);

    const overlay = document.getElementById("modalOverlay");
    const modal = document.getElementById("modal");

    overlay.classList.add("active");
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    const overlay = document.getElementById("modalOverlay");
    const modal = document.getElementById("modal");

    overlay.classList.remove("active");
    modal.classList.remove("active");
    document.body.style.overflow = "";
    this.selectedJob = null;
  }

  renderModal(job) {
    const modalContent = document.getElementById("modalContent");
    const companyInitial = job.company.charAt(0).toUpperCase();
    const logoColor = this.getCompanyColor(job.company);

    modalContent.innerHTML = `
                <div class="modal-job-header">
                    <div class="modal-job-logo" style="background: ${logoColor}">
                        ${companyInitial}
                    </div>
                    <div class="modal-job-info">
                        <h2>${job.title}</h2>
                        <p><strong>${job.company}</strong></p>
                        <p>📍 ${job.location}</p>
                        <p>🕒 ${job.timeAgoPosted}</p>
                        <p>💼 ${job.employmentType}</p>
                    </div>
                </div>

                <div class="modal-section">
                    <h3>Job Description</h3>
                    <p>${job.description || "No description available."}</p>
                </div>

                <div class="modal-section">
                    <h3>Salary Range</h3>
                    <p>${
                      job.salaryRange ||
                      "Competitive salary, commensurate with experience"
                    }</p>
                </div>

                <div class="modal-section">
                    <h3>Apply Now</h3>
                    <div class="job-providers">
                        ${
                          job.jobProviders
                            ?.map(
                              (provider) =>
                                `<a href="${provider.url}" target="_blank" class="provider-link">
                                Apply on ${provider.jobProvider}
                            </a>`
                            )
                            .join("") ||
                          "<p>No application links available.</p>"
                        }
                    </div>
                </div>
            `;
  }

  sortJobs(sortBy) {
    switch (sortBy) {
      case "date":
        this.jobs.sort((a, b) => {
          const timeA = this.parseTimeAgo(a.timeAgoPosted);
          const timeB = this.parseTimeAgo(b.timeAgoPosted);
          return timeA - timeB;
        });
        break;
      case "salary":
        this.jobs.sort((a, b) => {
          const salaryA = this.parseSalary(a.salaryRange);
          const salaryB = this.parseSalary(b.salaryRange);
          return salaryB - salaryA;
        });
        break;
      default:
        // Keep original order for relevance
        break;
    }
    this.renderJobs();
  }

  parseTimeAgo(timeStr) {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+)\s*(day|hour|week)/);
    if (!match) return 0;

    const num = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case "hour":
        return num;
      case "day":
        return num * 24;
      case "week":
        return num * 24 * 7;
      default:
        return 0;
    }
  }

  parseSalary(salaryStr) {
    if (!salaryStr) return 0;
    const match = salaryStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
}

// Initialize the job board when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new JobBoard();
});
