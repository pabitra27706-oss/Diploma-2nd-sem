// ============================================
// 2ND SEMESTER STUDY HUB - DATA (FULLY UPDATED)
// ============================================

const subjects = {

    "math-ii": {
        id: "math-ii",
        name: "Mathematics-II",
        shortName: "Math-II",
        icon: "📐",
        color: "#4CAF50",
        folder: "Mathematics-II",
        types: {
            units: {
                name: "Units / Notes",
                icon: "📖",
                color: "#4CAF50",
                items: [
                    { name: "Unit 1", file: "Mathematics-II-Unit-1.html", desc: "Determinants & Matrices" },
                    { name: "Unit 2", file: "Mathematics-II-Unit-2.html", desc: "Co-ordinate Geometry (2D)" },
                    { name: "Unit 3", file: "Mathematics-II-Unit-3.html", desc: "Integral Calculus" },
                    { name: "Unit 4", file: "Mathematics-II-Unit-4.html", desc: "Ordinary Differential Equation" },
                    { name: "Unit 5", file: "Mathematics-II-Unit-5.html", desc: "Partial Differentiation" },
                    { name: "Unit 6", file: "Mathematics-II-Unit-6.html", desc: "Statistics & Probability" }
                ]
            },
            pyq: {
                name: "Previous Year Questions",
                icon: "📝",
                color: "#FF9800",
                folder: "all_questions",
                items: [
                    { name: "PYQ 2021", file: "21.html", desc: "Year 2021 Paper" },
                    { name: "PYQ 2022", file: "22.html", desc: "Year 2022 Paper" },
                    { name: "PYQ 2023", file: "23.html", desc: "Year 2023 Paper" },
                    { name: "PYQ 2024", file: "24.html", desc: "Year 2024 Paper" },
                    { name: "PYQ 2025", file: "25.html", desc: "Year 2025 Paper" }
                ]
            },
            answers: {
                name: "Answers / Solutions",
                icon: "✅",
                color: "#4CAF50",
                isDirectType: true,
                directLink: "all_answers/index.html",
                desc: "Complete solutions"
            },
            formula: {
                name: "Formula Sheet",
                icon: "📋",
                color: "#9C27B0",
                isDirectType: true,
                directLink: "Formula-Sheet.html",
                desc: "Quick reference"
            }
        }
    },

    "physics-ii": {
        id: "physics-ii",
        name: "Applied Physics-II",
        shortName: "Physics-II",
        icon: "⚡",
        color: "#2196F3",
        folder: "Applied-Physics-II",
        types: {
            units: {
                name: "Units / Notes",
                icon: "📖",
                color: "#2196F3",
                items: [
                    { name: "Unit 1", file: "Applied-Physics-II-Unit-1.html", desc: "Wave Motion & Applications" },
                    { name: "Unit 2", file: "Applied-Physics-II-Unit-2.html", desc: "Optics" },
                    { name: "Unit 3", file: "Applied-Physics-II-Unit-3.html", desc: "Electrostatics" },
                    { name: "Unit 4", file: "Applied-Physics-II-Unit-4.html", desc: "Current Electricity" },
                    { name: "Unit 5", file: "Applied-Physics-II-Unit-5.html", desc: "Electromagnetism" },
                    { name: "Unit 6", file: "Applied-Physics-II-Unit-6.html", desc: "Semiconductor Physics" },
                    { name: "Unit 7", file: "Applied-Physics-II-Unit-7.html", desc: "Modern Physics" }
                ]
            },
            pyq: {
                name: "Previous Year Questions",
                icon: "📝",
                color: "#FF9800",
                folder: "all_questions",
                items: [
                    { name: "PYQ 2021", file: "21.html", desc: "Year 2021 Paper" },
                    { name: "PYQ 2022", file: "22.html", desc: "Year 2022 Paper" },
                    { name: "PYQ 2023", file: "23.html", desc: "Year 2023 Paper" },
                    { name: "PYQ 2024", file: "24.html", desc: "Year 2024 Paper" },
                    { name: "PYQ 2025", file: "25.html", desc: "Year 2025 Paper" }
                ]
            },
            answers: {
                name: "Answers / Solutions",
                icon: "✅",
                color: "#4CAF50",
                isDirectType: true,
                directLink: "all_answers/index.html",
                desc: "Complete solutions"
            },
            formula: {
                name: "Formula Sheet",
                icon: "📋",
                color: "#9C27B0",
                isDirectType: true,
                directLink: "Formula-Sheet.html",
                desc: "Quick reference"
            }
        }
    },

    "it-systems": {
        id: "it-systems",
        name: "IT Systems Theory",
        shortName: "IT Systems",
        icon: "💻",
        color: "#9C27B0",
        folder: "IT-Systems-Theory",
        types: {
            units: {
                name: "Units / Notes",
                icon: "📖",
                color: "#9C27B0",
                items: [
                    { name: "Unit 1", file: "IT-Systems-Unit-1.html", desc: "Basic Internet Skills & Number Systems" },
                    { name: "Unit 2", file: "IT-Systems-Unit-2.html", desc: "Operating Systems Overview" },
                    { name: "Unit 3", file: "IT-Systems-Unit-3.html", desc: "Algorithm & Flowcharts" },
                    { name: "Unit 4", file: "IT-Systems-Unit-4-Cybersecurity.html", desc: "Cybersecurity & Hacking Techniques" }
                ]
            },
            pyq: {
                name: "Previous Year Questions",
                icon: "📝",
                color: "#FF9800",
                folder: "all_questions",
                items: [
                    { name: "PYQ 2021", file: "21.html", desc: "Year 2021 Paper" },
                    { name: "PYQ 2022", file: "22.html", desc: "Year 2022 Paper" },
                    { name: "PYQ 2023", file: "23.html", desc: "Year 2023 Paper" },
                    { name: "PYQ 2024", file: "24.html", desc: "Year 2024 Paper" },
                    { name: "PYQ 2025", file: "25.html", desc: "Year 2025 Paper" }
                ]
            },
            answers: {
                name: "Answers / Solutions",
                icon: "✅",
                color: "#4CAF50",
                isDirectType: true,
                directLink: "all_answers/index.html",
                desc: "Complete solutions"
            }
        }
    },

    "feee": {
        id: "feee",
        name: "FEEE",
        shortName: "FEEE",
        icon: "🔌",
        color: "#FF9800",
        folder: "FEEE",
        types: {
            units: {
                name: "Units / Notes",
                icon: "📖",
                color: "#FF9800",
                items: [
                    { name: "Unit 1", file: "FEEE-Unit-1.html", desc: "Overview of Electrical Components" },
                    { name: "Unit 2", file: "FEEE-Unit-4.html", desc: "Electric and Magnetic Circuits" },
                    { name: "Unit 3", file: "FEEE-Unit-5.html", desc: "AC Circuits" },
                    { name: "Unit 4", file: "FEEE-Unit-6.html", desc: "Transformer and Machines" },
                    { name: "Unit 5", file: "FEEE-Unit-7.html", desc: "Semiconductor Fundamentals" },
                    { name: "Unit 6", file: "FEEE-Unit-2.html", desc: "Overview of Analog Circuits" },
                    { name: "Unit 7", file: "FEEE-Unit-3.html", desc: "Overview of Digital Electronics" }
                ]
            },
            pyq: {
                name: "Previous Year Questions",
                icon: "📝",
                color: "#FF9800",
                folder: "all_questions",
                items: [
                    { name: "PYQ 2021", file: "21.html", desc: "Year 2021 Paper" },
                    { name: "PYQ 2022", file: "22.html", desc: "Year 2022 Paper" },
                    { name: "PYQ 2023", file: "23.html", desc: "Year 2023 Paper" },
                    { name: "PYQ 2024", file: "24.html", desc: "Year 2024 Paper" },
                    { name: "PYQ 2025", file: "25.html", desc: "Year 2025 Paper" }
                ]
            },
            answers: {
                name: "Answers / Solutions",
                icon: "✅",
                color: "#4CAF50",
                isDirectType: true,
                directLink: "all_answers/index.html",
                desc: "Complete solutions"
            },
            formula: {
                name: "Formula Sheet",
                icon: "📋",
                color: "#9C27B0",
                isDirectType: true,
                directLink: "Formula-Sheet.html",
                desc: "Quick reference"
            }
        }
    },

    "eng-mech": {
        id: "eng-mech",
        name: "Engineering Mechanics",
        shortName: "Eng Mechanics",
        icon: "⚙️",
        color: "#F44336",
        folder: "Engineering-Mechanics",
        types: {
            units: {
                name: "Units / Notes",
                icon: "📖",
                color: "#F44336",
                items: [
                    { name: "Unit 1", file: "Engineering-Mechanics-Unit-1.html", desc: "Basics of Mechanics & Force System" },
                    { name: "Unit 2", file: "Engineering-Mechanics-Unit-2.html", desc: "Moments & Couples" },
                    { name: "Unit 3", file: "Engineering-Mechanics-Unit-3.html", desc: "Condition of Equilibrium" },
                    { name: "Unit 4", file: "Engineering-Mechanics-Unit-4.html", desc: "Friction" },
                    { name: "Unit 5", file: "Engineering-Mechanics-Unit-5.html", desc: "Centroid & Centre of Gravity" },
                    { name: "Unit 6", file: "Engineering-Mechanics-Unit-6.html", desc: "Simple Lifting Machines" },
                    { name: "Motion in Plane", file: "Engineering-Mechanics-Motion-in-Plane.html", desc: "Motion in a Plane (Rectilinear & Curvilinear)" }
                ]
            },
            pyq: {
                name: "Previous Year Questions",
                icon: "📝",
                color: "#FF9800",
                folder: "all_questions",
                items: [
                    { name: "PYQ 2021", file: "21.html", desc: "Year 2021 Paper" },
                    { name: "PYQ 2022", file: "22.html", desc: "Year 2022 Paper" },
                    { name: "PYQ 2023", file: "23.html", desc: "Year 2023 Paper" },
                    { name: "PYQ 2024", file: "24.html", desc: "Year 2024 Paper" },
                    { name: "PYQ 2025", file: "25.html", desc: "Year 2025 Paper" }
                ]
            },
            answers: {
                name: "Answers / Solutions",
                icon: "✅",
                color: "#4CAF50",
                isDirectType: true,
                directLink: "all_answers/index.html",
                desc: "Complete solutions"
            }
        }
    },

    "practice": {
        id: "practice",
        name: "Practice Questions",
        shortName: "Practice Zone",
        icon: "📝",
        color: "#00BCD4",
        isPractice: true,
        folder: "Practice_question",
        options: [
            {
                name: "Practice Questions",
                icon: "✏️",
                color: "#00BCD4",
                desc: "Daily practice (Day 1-15)",
                link: "Practice_question/questions/index.html"
            },
            {
                name: "Study Roadmap",
                icon: "🗺️",
                color: "#FF6B6B",
                desc: "Complete preparation plan",
                link: "Practice_question/roadmap.html"
            }
        ]
    }
};

// More Section Links
const moreLinks = [
    {
        section: "App Info",
        items: [
            { name: "About App", desc: "Learn about Study Hub", icon: "fas fa-info-circle", color: "blue", link: "app-resorses/sections/about-app.html" },
            { name: "Usage Guide", desc: "How to use this app", icon: "fas fa-book-reader", color: "green", link: "app-resorses/sections/usage-guide.html" },
            { name: "Professional Hub", desc: "Extra resources", icon: "fas fa-briefcase", color: "purple", link: "app-resorses/sections/professional-hub.html" }
        ]
    },
    {
        section: "Support",
        items: [
            { name: "Contact Support", desc: "Get help & assistance", icon: "fas fa-envelope", color: "cyan", link: "app-resorses/sections/contact-support.html" },
            { name: "Send Feedback", desc: "Share your thoughts", icon: "fas fa-comment-dots", color: "orange", link: "app-resorses/sections/send-feedback.html" }
        ]
    },
    {
        section: "Legal",
        items: [
            { name: "Terms & Conditions", desc: "Terms of use", icon: "fas fa-file-contract", color: "orange", link: "app-resorses/sections/terms-conditions.html" },
            { name: "Privacy Policy", desc: "Your privacy matters", icon: "fas fa-shield-alt", color: "green", link: "app-resorses/sections/privacy-policy.html" },
            { name: "Disclaimer", desc: "Important notice", icon: "fas fa-exclamation-triangle", color: "red", link: "app-resorses/sections/disclaimer-notice.html" },
            { name: "Credits & Thanks", desc: "Acknowledgements", icon: "fas fa-heart", color: "red", link: "app-resorses/sections/credits-thanks.html" }
        ]
    }
];