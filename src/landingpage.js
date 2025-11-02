// src/LandingPage.js
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartCoding = () => {
    // Generate a random room ID for immediate coding
    const roomId = Math.random().toString(36).substring(2, 15);
    navigate(`/editor/${roomId}`, {
      state: {
        username: `User_${Math.random().toString(36).substring(2, 7)}`
      }
    });
  };

  useEffect(() => {
    // Smooth scrolling for navigation links
    const handleSmoothScroll = (e) => {
      if (e.target.getAttribute("href")?.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute("href"));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    };

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", handleSmoothScroll);
    });

    // Scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".fade-in").forEach((el) => {
      observer.observe(el);
    });

    // Navbar background on scroll
    const handleScroll = () => {
      const navbar = document.querySelector(".navbar");
      if (navbar && window.scrollY > 100) {
        navbar.style.background = "rgba(10, 10, 10, 0.95)";
      } else if (navbar) {
        navbar.style.background = "rgba(10, 10, 10, 0.9)";
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Hero parallax effect
    const handleHeroParallax = () => {
      const hero = document.querySelector(".hero");
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      if (rect.bottom > 0 && rect.top < viewportHeight) {
        const scrolledInHero = Math.min(Math.max(-rect.top, 0), viewportHeight);
        const translateY = Math.min(scrolledInHero * 0.3, 80);
        if (hero.style) {
          hero.style.transform = `translateY(${translateY}px)`;
        }
      } else if (hero.style) {
        hero.style.transform = "translateY(0px)";
      }
    };

    window.addEventListener("scroll", handleHeroParallax);

    // Floating words effect - enhanced version
    const codingWords = [
      "function","const","let","var","class","import","export","return",
      "async","await","promise","callback","API","JSON","XML","HTTP",
      "console.log","array.map","forEach","filter","reduce","splice",
      "useState","useEffect","component","props","state","render",
      "git push","git pull","merge","branch","commit","clone",
      "debug","console","error","exception","try","catch",
      "algorithm","boolean","string","integer","float","object",
      "loop","iteration","recursion","stack","queue","binary",
      "deploy","build","compile","execute","runtime","memory",
      "database","query","table","index","schema","migration"
    ];

    function createFloatingWord() {
      const floatingContainer = document.querySelector(".floating-words");
      if (!floatingContainer) return;

      const word = codingWords[Math.floor(Math.random() * codingWords.length)];
      const span = document.createElement("span");
      span.className = "word";
      span.textContent = word;

      // Random positioning with better distribution
      span.style.setProperty("--x", Math.random() * 85 + 5 + "%");
      span.style.setProperty("--y", Math.random() * 85 + 5 + "%");
      span.style.setProperty("--delay", Math.random() * 3 + "s");

      floatingContainer.appendChild(span);

      // Remove word after animation completes (longer duration)
      setTimeout(() => {
        if (span.parentNode) {
          span.remove();
        }
      }, 20000); // Increased from 15s to 20s
    }

    // Create initial batch of dynamic words
    for (let i = 0; i < 8; i++) {
      setTimeout(createFloatingWord, i * 300);
    }

    // Continue creating words at a slower pace
    const interval = setInterval(createFloatingWord, 1200); // Slower interval

    // Cleanup
    return () => {
      clearInterval(interval);
      // Remove all event listeners
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.removeEventListener("click", handleSmoothScroll);
      });
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleHeroParallax);
      
      // Clear any remaining floating words
      const floatingContainer = document.querySelector(".floating-words");
      if (floatingContainer) {
        floatingContainer.innerHTML = '';
      }
    };
  }, []);

  return (
    <>
      <div className="bg-pattern"></div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">CodeGen4Future</div>
          <ul className="nav-menu">
            <li><a href="#features">Features</a></li>
            <li><a href="#languages">Languages</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#community">Community</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Code, Compile, Collaborate — Anywhere.</h1>
          <p>The future of coding is in your browser.</p>
          <div className="cta-buttons">
            <Link to="/simple-editor" className="btn btn-primary">Start Coding</Link>
             <Link to="/simple-editor" className="btn btn-secondary">Simple Editor</Link>
             <Link to="/home" className="btn btn-secondary">Create a Room</Link>
             <Link to="/contests" className="btn btn-secondary">Join Contests</Link>
             <a href="#features" className="btn btn-secondary">Learn More</a>
           </div>
        </div>
      </section>

      {/* Floating Words */}
      <div className="floating-words">
        {/* Initial static words for better visual effect */}
        <span className="word" style={{'--delay': '0s', '--x': '10%', '--y': '15%'}}>function</span>
        <span className="word" style={{'--delay': '2s', '--x': '85%', '--y': '25%'}}>async</span>
        <span className="word" style={{'--delay': '1s', '--x': '20%', '--y': '70%'}}>console.log</span>
        <span className="word" style={{'--delay': '3s', '--x': '75%', '--y': '60%'}}>import</span>
        <span className="word" style={{'--delay': '1.5s', '--x': '40%', '--y': '20%'}}>class</span>
        <span className="word" style={{'--delay': '4s', '--x': '60%', '--y': '80%'}}>return</span>
        <span className="word" style={{'--delay': '0.5s', '--x': '90%', '--y': '45%'}}>const</span>
        <span className="word" style={{'--delay': '2.5s', '--x': '15%', '--y': '50%'}}>array.map</span>
        <span className="word" style={{'--delay': '3.5s', '--x': '50%', '--y': '10%'}}>useState</span>
        <span className="word" style={{'--delay': '1.8s', '--x': '80%', '--y': '75%'}}>API</span>
        <span className="word" style={{'--delay': '2.8s', '--x': '25%', '--y': '85%'}}>JSON</span>
        <span className="word" style={{'--delay': '0.8s', '--x': '95%', '--y': '30%'}}>forEach</span>
        <span className="word" style={{'--delay': '4.5s', '--x': '35%', '--y': '90%'}}>git push</span>
        <span className="word" style={{'--delay': '1.2s', '--x': '70%', '--y': '15%'}}>await</span>
        <span className="word" style={{'--delay': '3.8s', '--x': '5%', '--y': '65%'}}>merge</span>
        <span className="word" style={{'--delay': '2.2s', '--x': '55%', '--y': '40%'}}>debug</span>
        <span className="word" style={{'--delay': '4.2s', '--x': '85%', '--y': '85%'}}>deploy</span>
        <span className="word" style={{'--delay': '1.7s', '--x': '30%', '--y': '35%'}}>algorithm</span>
        <span className="word" style={{'--delay': '2.2s', '--x': '65%', '--y': '65%'}}>boolean</span>
        <span className="word" style={{'--delay': '0.3s', '--x': '45%', '--y': '55%'}}>variable</span>
      </div>

      {/* Features */}
      <section id="features" className="section fade-in">
        <h2 className="section-title">Powerful Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Real-time Collaboration</h3>
            <p>Code together with your team in real-time. See changes instantly and communicate through integrated chat.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Multi-language Compiler</h3>
            <p>Support for Python, Java, C++, JavaScript, and more. Switch between languages seamlessly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Zero Setup Required</h3>
            <p>No installations, no configurations. Just open your browser and start coding immediately.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📤</div>
            <h3>Save & Share Instantly</h3>
            <p>Save your projects to the cloud and share them with a simple link. Perfect for learning and teaching.</p>
          </div>
        </div>
      </section>

      {/* Languages */}
      <section id="languages" className="section fade-in">
        <h2 className="section-title">Supported Languages</h2>
        <div className="languages-grid">
          <div className="language-badge"><span className="lang-icon">🐍</span><strong>Python</strong></div>
          <div className="language-badge"><span className="lang-icon">☕</span><strong>Java</strong></div>
          <div className="language-badge"><span className="lang-icon">⚙️</span><strong>C++</strong></div>
          <div className="language-badge"><span className="lang-icon">📜</span><strong>JavaScript</strong></div>
          <div className="language-badge"><span className="lang-icon">🦀</span><strong>Rust</strong></div>
          <div className="language-badge"><span className="lang-icon">🔷</span><strong>TypeScript</strong></div>
          <div className="language-badge"><span className="lang-icon">🔶</span><strong>Go</strong></div>
          <div className="language-badge"><span className="lang-icon">💎</span><strong>Ruby</strong></div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section fade-in">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step"><div className="step-number">1</div><h3>Choose Language</h3><p>Select from our extensive library of programming languages and frameworks.</p></div>
          <div className="step"><div className="step-number">2</div><h3>Write Code</h3><p>Use our intelligent editor with syntax highlighting, auto-completion, and error detection.</p></div>
          <div className="step"><div className="step-number">3</div><h3>Run & Share</h3><p>Compile and execute your code instantly. Share your projects with the community.</p></div>
        </div>
      </section>

      {/* Community */}
      <section id="community" className="section fade-in">
        <h2 className="section-title">What Developers Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial"><p className="testimonial-text">CodeGen4Future has revolutionized how I teach programming. Students can code together in real-time, and I can see their progress instantly.</p><p className="testimonial-author">— Sarah Chen, CS Professor</p></div>
          <div className="testimonial"><p className="testimonial-text">Amazing platform! No more setup headaches. I can prototype ideas quickly and share them with my team immediately.</p><p className="testimonial-author">— Marcus Rodriguez, Software Engineer</p></div>
          <div className="testimonial"><p className="testimonial-text">Perfect for coding interviews and technical assessments. The multi-language support is fantastic.</p><p className="testimonial-author">— Aisha Patel, Tech Recruiter</p></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#">About</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Contact</a>
            <a href="#">Documentation</a>
            <a href="#">API</a>
          </div>
          <div className="social-icons">
            <a href="#" className="social-icon">📧</a>
            <a href="#" className="social-icon">🐱</a>
            <a href="#" className="social-icon">🐦</a>
            <a href="#" className="social-icon">💼</a>
          </div>
          <p>&copy; 2025 CodeGen4Future. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
