INSERT INTO users (name, email, password_hash, mobile, target_exam, preferred_language, preparation_level)
VALUES
('Aarav Sharma', 'aarav.sharma@example.com', 'hash123', '9876543210', 'JEE', 'English', 'Intermediate'),
('Diya Mehta', 'diya.mehta@example.com', 'hash124', '9876543211', 'NEET', 'Hindi', 'Beginner'),
('Rohan Gupta', 'rohan.gupta@example.com', 'hash125', '9876543212', 'CAT', 'English', 'Advanced'),
('Isha Roy', 'isha.roy@example.com', 'hash126', '9876543213', 'UPSC', 'English', 'Intermediate'),
('Kabir Das', 'kabir.das@example.com', 'hash127', '9876543214', 'GATE', 'Telugu', 'Beginner'),
('Sneha Kapoor', 'sneha.kapoor@example.com', 'hash128', '9876543215', 'JEE', 'English', 'Advanced'),
('Aditya Verma', 'aditya.verma@example.com', 'hash129', '9876543216', 'NEET', 'Kannada', 'Intermediate'),
('Meera Iyer', 'meera.iyer@example.com', 'hash130', '9876543217', 'UPSC', 'Tamil', 'Beginner'),
('Arjun Nair', 'arjun.nair@example.com', 'hash131', '9876543218', 'CAT', 'English', 'Intermediate'),
('Tanya Reddy', 'tanya.reddy@example.com', 'hash132', '9876543219', 'SSC', 'Hindi', 'Beginner'),
('Dev Patel', 'dev.patel@example.com', 'hash133', '9876543220', 'Banking', 'English', 'Advanced'),
('Anaya Joshi', 'anaya.joshi@example.com', 'hash134', '9876543221', 'JEE', 'Gujarati', 'Intermediate'),
('Yash Thakur', 'yash.thakur@example.com', 'hash135', '9876543222', 'GATE', 'English', 'Beginner'),
('Sana Khan', 'sana.khan@example.com', 'hash136', '9876543223', 'UPSC', 'Urdu', 'Advanced'),
('Vikram Rao', 'vikram.rao@example.com', 'hash137', '9876543224', 'NEET', 'Telugu', 'Intermediate'),
('Pooja Jain', 'pooja.jain@example.com', 'hash138', '9876543225', 'SSC', 'English', 'Beginner'),
('Nikhil Das', 'nikhil.das@example.com', 'hash139', '9876543226', 'Banking', 'Hindi', 'Intermediate'),
('Reema Dutt', 'reema.dutt@example.com', 'hash140', '9876543227', 'CAT', 'English', 'Advanced'),
('Harshita Malhotra', 'harshita.malhotra@example.com', 'hash141', '9876543228', 'JEE', 'Bengali', 'Beginner'),
('Aman Choudhary', 'aman.choudhary@example.com', 'hash142', '9876543229', 'NEET', 'English', 'Intermediate');


-- Educators
INSERT INTO educators (name, email, password_hash, mobile, qualification, experience, bio, rating, is_verified, image_url) VALUES
('Dr. Sarah Kumar', 'sarah@example.com', '$2a$10$XZQ7YhLzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7Zz', '+919876543215', 'PhD in Physics, IIT Delhi', 8, '8+ years of teaching experience with specialization in Modern Physics', 4.8, TRUE, 'https://example.com/images/sarah.jpg'),
('Prof. Rajesh Iyer', 'rajesh@example.com', '$2a$10$XZQ7YhLzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7Zz', '+919876543216', 'M.Tech in Computer Science, IIT Bombay', 6, 'Expert in Data Structures and Algorithms', 4.6, TRUE, 'https://example.com/images/rajesh.jpg'),
('Dr. Anjali Mehta', 'anjali@example.com', '$2a$10$XZQ7YhLzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7Zz', '+919876543217', 'MD in Medicine, AIIMS Delhi', 10, 'Senior faculty for NEET preparation', 4.9, TRUE, 'https://example.com/images/anjali.jpg'),
('Prof. Arun Joshi', 'arun@example.com', '$2a$10$XZQ7YhLzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7Zz', '+919876543218', 'M.Sc in Mathematics, ISI Kolkata', 7, 'Specialized in Calculus and Algebra', 4.7, TRUE, 'https://example.com/images/arun.jpg'),
('Dr. Priyanka Reddy', 'priyanka@example.com', '$2a$10$XZQ7YhLzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7ZzY7Zz', '+919876543219', 'PhD in Organic Chemistry, NCL Pune', 5, 'Expert in Organic Chemistry for JEE and NEET', 4.5, FALSE, 'https://example.com/images/priyanka.jpg');

-- Educator subjects
INSERT INTO educator_subjects (educator_id, subject) VALUES
(1, 'Physics'),
(1, 'Modern Physics'),
(2, 'Computer Science'),
(2, 'Data Structures'),
(2, 'Algorithms'),
(3, 'Biology'),
(3, 'Medicine'),
(4, 'Mathematics'),
(4, 'Calculus'),
(4, 'Algebra'),
(5, 'Chemistry'),
(5, 'Organic Chemistry');

INSERT INTO courses (
    title, description, educator_id, target_exam, duration, validity, total_lessons,
    price, highlights,features, discounted_price, type, language, thumbnail, rating, enrolled_students
) VALUES
(
    'Complete Physics for JEE Main + Advanced',
    'Covers all concepts from Mechanics to Modern Physics for JEE preparation.',
    1, 'JEE', '6 months', '1 year', 120, 5999,
    '["120+ video lectures","50+ live problem solving sessions","10 mock tests","Doubt clearing sessions"]',
    '{"liveClasses": 50, "recordedVideos": 120, "mockTests": 10, "pdfNotes": true, "doubtSupport": true, "previousYearQuestions": 500}',
    3999, 'live', 'English', 'https://example.com/thumbs/physics-jee.jpg', 4.7, 15420
),
(
    'Modern Physics Masterclass',
    'Specialized course focusing on Modern Physics concepts.',
    1, 'JEE', '3 months', '6 months', 60, 2999,
    '["60 video lessons","Numerical practice","Concept boosters","Live Q&A"]','{"liveClasses": 60, "recordedVideos": 150, "mockTests": 15, "pdfNotes": true, "doubtSupport": true, "formulaSheets": 25}',
    1999, 'live', 'English', 'https://example.com/thumbs/modern-physics.jpg', 4.6, 9420
),
(
    'DSA Crash Course',
    'Fast-paced course covering Data Structures and Algorithms.',
    2, 'GATE', '2 months', '3 months', 50, 4999,
    '["Hands-on coding","30+ problems","Mock interviews","Live coding"]', 
    '{"liveClasses": 50, "mockTests": 10, "pdfNotes": true, "mockInterviews": "unlimited"}',
    3499, 'live', 'English', 'https://example.com/thumbs/dsa-crash.jpg', 4.5, 8800
),
(
    'Complete Computer Science Foundation',
    'A detailed course covering core CS subjects.',
    2, 'GATE', '6 months', '1 year', 100, 7999,
    '["Theory + Practice","50 assignments","30 mock tests","Interview preparation"]', 
    '{"Assignments": 50, "recordedVideos": 100, "mockTests": 30, "Interview preparation": true}',
    5999, 'recorded', 'English', 'https://example.com/thumbs/cs-foundation.jpg', 4.8, 12150
),
(
    'NEET Biology Master Course',
    'Biology concepts taught with a clinical perspective.',
    3, 'NEET', '6 months', '1 year', 140, 6499,
    '["Diagrams and mnemonics","Video lectures","Doubt clearing","Tests & notes"]',
    '{"diagrams": true, "mnemonics": true, "doubtSupport": true, "tests": 10, "notes": true, "liveSessions" : 100}',
    4499, 'live', 'English', 'https://example.com/thumbs/neet-bio.jpg', 4.9, 18900
),
(
    'Medicine Foundation for NEET',
    'Learn foundational medical concepts to excel in NEET.',
    3, 'NEET', '4 months', '6 months', 80, 4999,
    '["Clinical insights","Previous year questions","Weekly tests","Video lectures"]',
'{"clinicalInsights": true, "previousYearQuestions": true, "weeklyTests": true, "videoLectures": 50}',
    3499, 'live', 'English', 'https://example.com/thumbs/medicine-neet.jpg', 4.8, 11000
),
(
    'Mathematics for Competitive Exams',
    'Complete math course for JEE, GATE, and SSC.',
    4, 'JEE', '5 months', '9 months', 100, 5999,
    '["Conceptual clarity","Solved problems","Live sessions","Weekly quizzes"]',
'{"conceptualClarity": true, "solvedProblems": true, "liveSessions": true, "weeklyQuizzes": true}',
    4299, 'live', 'English', 'https://example.com/thumbs/math-complete.jpg', 4.7, 14300
),
(
    'Algebra and Calculus Core Concepts',
    'In-depth focus on Algebra and Calculus topics.',
    4, 'JEE', '3 months', '6 months', 60, 3499,
    '["Worked examples","Live problem solving","PDF notes","Shortcuts"]',
'{"workedExamples": true, "liveProblemSolving": true, "pdfNotes": true, "shortcuts": true}',
    2499, 'live', 'English', 'https://example.com/thumbs/algebra-calc.jpg', 4.6, 9700
),
(
    'Target JEE Chemistry Booster',
    'Focused course to boost your JEE Chemistry score.',
    5, 'JEE', '2 months', '3 months', 40, 2999,
    '["Flashcards","Important reactions","Live classes","Mock quizzes"]',
'{"flashcards": true, "importantReactions": true, "liveClasses": true, "mockQuizzes": true}',
    2199, 'live', 'English', 'https://example.com/thumbs/chemistry-jee.jpg', 4.4, 7400
),
(
'NEET Chemistry Masterclass', 
    'Complete Chemistry course for NEET covering organic chemistry',
    1, 'NEET','6 months', '6 months', 50, 4999,
    '["75+ focused lectures", "NCERT based content", "Previous year questions", "Concept clarity", "Formula derivations", "Quick revision"]',
    '{"liveClasses": 25, "recordedVideos": 75, "mockTests": 8, "pdfNotes": true, "doubtSupport": true, "formulaDerivations": 50}',
    1600, 'recorded', 'English', 'https://example.com/thumbs/neet-chemistry.jpg', 4.8, 10000
);

INSERT INTO course_chapters (course_id, title, description, order_index) VALUES
-- Course 1: Complete Physics for JEE
(1, 'Kinematics & Dynamics', 'Understanding motion, Newton’s laws, and applications.', 1),
(1, 'Work, Energy & Power', 'Concepts of energy, power, and work-energy theorem.', 2),
(1, 'Modern Physics', 'Photoelectric effect, nuclei, and atomic structure.', 3),

-- Course 2: Modern Physics Masterclass
(2, 'Atomic Models', 'Evolution from Rutherford to Quantum models.', 1),
(2, 'Photoelectric Effect', 'Einstein’s theory and experiment-based insights.', 2),
(2, 'Nuclear Physics', 'Radioactivity, decay laws, and nuclear reactions.', 3),

-- Course 3: DSA Crash Course
(3, 'Arrays and Strings', 'Foundational data structures and manipulation.', 1),
(3, 'Stacks and Queues', 'LIFO and FIFO structures with applications.', 2),
(3, 'Trees and Graphs', 'Intro to trees, binary trees, and graph traversal.', 3),

-- Course 4: Complete Computer Science Foundation
(4, 'Computer Architecture', 'Basics of hardware systems and design.', 1),
(4, 'Operating Systems', 'Processes, threads, and memory management.', 2),
(4, 'Databases and SQL', 'Relational databases, normalization, and queries.', 3),

-- Course 5: NEET Biology Master Course
(5, 'Human Physiology', 'Body systems and their mechanisms.', 1),
(5, 'Genetics and Evolution', 'Inheritance laws and Darwinian theory.', 2),
(5, 'Plant Physiology', 'Processes like photosynthesis and transpiration.', 3),

-- Course 6: Medicine Foundation for NEET
(6, 'Cell Structure', 'Detailed view of prokaryotic and eukaryotic cells.', 1),
(6, 'Diseases and Immunity', 'Common diseases and immune responses.', 2),
(6, 'Medical Terminology', 'Basic clinical terms and concepts.', 3),

-- Course 7: Mathematics for Competitive Exams
(7, 'Quadratic Equations', 'Roots, graphs, and real-life applications.', 1),
(7, 'Sequences & Series', 'AP, GP, and their sums.', 2),
(7, 'Probability & Statistics', 'Basic concepts with examples.', 3),

-- Course 8: Algebra and Calculus Core Concepts
(8, 'Functions & Graphs', 'Types of functions and curve sketching.', 1),
(8, 'Limits & Continuity', 'Foundational concepts in Calculus.', 2),
(8, 'Differentiation', 'Rules, applications, and problem solving.', 3),

-- Course 9: Organic Chemistry Simplified
(9, 'Hydrocarbons', 'Alkanes, alkenes, and alkynes.', 1),
(9, 'Reaction Mechanisms', 'SN1, SN2, E1, E2 mechanisms.', 2),
(9, 'Alcohols, Phenols & Ethers', 'Structure, naming, and properties.', 3),

-- Course 10: Target JEE Chemistry Booster
(10, 'Chemical Bonding', 'Ionic, covalent, and hybridization.', 1),
(10, 'Periodic Table', 'Trends and element classification.', 2),
(10, 'Thermodynamics', 'Energy changes in chemical reactions.', 3);

INSERT INTO lessons (course_id, chapter_id, title, description, video_url, duration_seconds, order_index, is_free, resources) VALUES
(1, 1, 'Kinematics & Dynamics - Lesson 1', 'In-depth explanation of kinematics & dynamics, part 1.', 'https://example.com/videos/course1_chapter1_lesson1.mp4', 793, 1, TRUE, '["notes_ch1_l1.pdf", "slides_ch1_l1.pptx"]'),
(1, 1, 'Kinematics & Dynamics - Lesson 2', 'In-depth explanation of kinematics & dynamics, part 2.', 'https://example.com/videos/course1_chapter1_lesson2.mp4', 625, 2, FALSE, '["notes_ch1_l2.pdf", "slides_ch1_l2.pptx"]'),
(1, 2, 'Work, Energy & Power - Lesson 1', 'In-depth explanation of work, energy & power, part 1.', 'https://example.com/videos/course1_chapter2_lesson1.mp4', 651, 1, TRUE, '["notes_ch2_l1.pdf", "slides_ch2_l1.pptx"]'),
(1, 3, 'Modern Physics - Lesson 1', 'In-depth explanation of modern physics, part 1.', 'https://example.com/videos/course1_chapter3_lesson1.mp4', 781, 1, TRUE, '["notes_ch3_l1.pdf", "slides_ch3_l1.pptx"]'),

(2, 4, 'Atomic Models - Lesson 1', 'In-depth explanation of atomic models, part 1.', 'https://example.com/videos/course2_chapter4_lesson1.mp4', 753, 1, TRUE, '["notes_ch4_l1.pdf", "slides_ch4_l1.pptx"]'),
(2, 5, 'Photoelectric Effect - Lesson 1', 'In-depth explanation of photoelectric effect, part 1.', 'https://example.com/videos/course2_chapter5_lesson1.mp4', 571, 1, TRUE, '["notes_ch5_l1.pdf", "slides_ch5_l1.pptx"]'),
(2, 5, 'Photoelectric Effect - Lesson 2', 'In-depth explanation of photoelectric effect, part 2.', 'https://example.com/videos/course2_chapter5_lesson2.mp4', 703, 2, FALSE, '["notes_ch5_l2.pdf", "slides_ch5_l2.pptx"]'),
(2, 6, 'Nuclear Physics - Lesson 1', 'In-depth explanation of nuclear physics, part 1.', 'https://example.com/videos/course2_chapter6_lesson1.mp4', 879, 1, TRUE, '["notes_ch6_l1.pdf", "slides_ch6_l1.pptx"]'),

(3, 7, 'Arrays and Strings - Lesson 1', 'In-depth explanation of arrays and strings, part 1.', 'https://example.com/videos/course3_chapter7_lesson1.mp4', 463, 1, TRUE, '["notes_ch7_l1.pdf", "slides_ch7_l1.pptx"]'),
(3, 8, 'Stacks and Queues - Lesson 1', 'In-depth explanation of stacks and queues, part 1.', 'https://example.com/videos/course3_chapter8_lesson1.mp4', 457, 1, TRUE, '["notes_ch8_l1.pdf", "slides_ch8_l1.pptx"]'),
(3, 9, 'Trees and Graphs - Lesson 1', 'In-depth explanation of trees and graphs, part 1.', 'https://example.com/videos/course3_chapter9_lesson1.mp4', 545, 1, TRUE, '["notes_ch9_l1.pdf", "slides_ch9_l1.pptx"]'),

(4, 10, 'Computer Architecture - Lesson 1', 'In-depth explanation of computer architecture, part 1.', 'https://example.com/videos/course4_chapter10_lesson1.mp4', 652, 1, TRUE, '["notes_ch10_l1.pdf", "slides_ch10_l1.pptx"]'),
(4, 11, 'Operating Systems - Lesson 1', 'In-depth explanation of operating systems, part 1.', 'https://example.com/videos/course4_chapter11_lesson1.mp4', 624, 1, TRUE, '["notes_ch11_l1.pdf", "slides_ch11_l1.pptx"]'),
(4, 12, 'Databases and SQL - Lesson 1', 'In-depth explanation of databases and sql, part 1.', 'https://example.com/videos/course4_chapter12_lesson1.mp4', 616, 1, TRUE, '["notes_ch12_l1.pdf", "slides_ch12_l1.pptx"]'),
(4, 12, 'Databases and SQL - Lesson 2', 'In-depth explanation of databases and sql, part 2.', 'https://example.com/videos/course4_chapter12_lesson2.mp4', 496, 2, FALSE, '["notes_ch12_l2.pdf", "slides_ch12_l2.pptx"]'),

(5, 13, 'Human Physiology - Lesson 1', 'In-depth explanation of human physiology, part 1.', 'https://example.com/videos/course5_chapter13_lesson1.mp4', 490, 1, TRUE, '["notes_ch13_l1.pdf", "slides_ch13_l1.pptx"]'),
(5, 14, 'Genetics and Evolution - Lesson 1', 'In-depth explanation of genetics and evolution, part 1.', 'https://example.com/videos/course5_chapter14_lesson1.mp4', 380, 1, TRUE, '["notes_ch14_l1.pdf", "slides_ch14_l1.pptx"]'),
(5, 15, 'Plant Physiology - Lesson 1', 'In-depth explanation of plant physiology, part 1.', 'https://example.com/videos/course5_chapter15_lesson1.mp4', 376, 1, TRUE, '["notes_ch15_l1.pdf", "slides_ch15_l1.pptx"]'),

(6, 16, 'Cell Structure - Lesson 1', 'In-depth explanation of cell structure, part 1.', 'https://example.com/videos/course6_chapter16_lesson1.mp4', 470, 1, TRUE, '["notes_ch16_l1.pdf", "slides_ch16_l1.pptx"]'),
(6, 17, 'Diseases and Immunity - Lesson 1', 'In-depth explanation of diseases and immunity, part 1.', 'https://example.com/videos/course6_chapter17_lesson1.mp4', 344, 1, TRUE, '["notes_ch17_l1.pdf", "slides_ch17_l1.pptx"]'),
(6, 17, 'Diseases and Immunity - Lesson 2', 'In-depth explanation of diseases and immunity, part 2.', 'https://example.com/videos/course6_chapter17_lesson2.mp4', 332, 2, FALSE, '["notes_ch17_l2.pdf", "slides_ch17_l2.pptx"]'),
(6, 18, 'Medical Terminology - Lesson 1', 'In-depth explanation of medical terminology, part 1.', 'https://example.com/videos/course6_chapter18_lesson1.mp4', 448, 1, TRUE, '["notes_ch18_l1.pdf", "slides_ch18_l1.pptx"]'),
(6, 18, 'Medical Terminology - Lesson 2', 'In-depth explanation of medical terminology, part 2.', 'https://example.com/videos/course6_chapter18_lesson2.mp4', 749, 2, FALSE, '["notes_ch18_l2.pdf", "slides_ch18_l2.pptx"]'),

(7, 19, 'Quadratic Equations - Lesson 1', 'In-depth explanation of quadratic equations, part 1.', 'https://example.com/videos/course7_chapter19_lesson1.mp4', 619, 1, TRUE, '["notes_ch19_l1.pdf", "slides_ch19_l1.pptx"]'),
(7, 20, 'Sequences & Series - Lesson 1', 'In-depth explanation of sequences & series, part 1.', 'https://example.com/videos/course7_chapter20_lesson1.mp4', 313, 1, TRUE, '["notes_ch20_l1.pdf", "slides_ch20_l1.pptx"]'),

(8, 22, 'Functions & Graphs - Lesson 1', 'Understanding different types of functions: linear, quadratic, exponential.', 'https://example.com/videos/course8_chapter22_lesson1.mp4', 660, 1, TRUE, '["functions_basics.pdf", "graph_sketching_intro.pptx"]'),
(8, 22, 'Functions & Graphs - Lesson 2', 'Graph transformations and curve sketching techniques.', 'https://example.com/videos/course8_chapter22_lesson2.mp4', 740, 2, FALSE, '["graph_transformations.pdf", "practice_curves.docx"]'),
(8, 23, 'Limits & Continuity - Lesson 1', 'Defining limits, left and right-hand limits, and evaluation.', 'https://example.com/videos/course8_chapter23_lesson1.mp4', 720, 1, TRUE, '["limits_handbook.pdf", "limit_exercises.xlsx"]'),
(8, 23, 'Limits & Continuity - Lesson 2', 'Understanding continuity, discontinuities, and their graphical representation.', 'https://example.com/videos/course8_chapter23_lesson2.mp4', 690, 2, FALSE, '["continuity_concepts.pdf", "graphical_problems.pptx"]'),
(8, 24, 'Differentiation - Lesson 1', 'Basic differentiation rules and derivative formulas.', 'https://example.com/videos/course8_chapter24_lesson1.mp4', 710, 1, TRUE, '["differentiation_rules.pdf", "derivatives_quickref.docx"]'),

(9, 25, 'Organic Chemistry Basics', 'Introduction to organic compounds and nomenclature', 'https://example.com/secure/video/3001', 3600, 1, 1, '[{"type": "pdf", "title": "Organic Chemistry Basics", "url": "https://example.com/notes/organic.pdf"}, {"type": "pdf", "title": "IUPAC Nomenclature", "url": "https://example.com/notes/nomenclature.pdf"}]'),
(9, 26,  'Isomerism', 'Structural and stereoisomerism, optical activity', 'https://example.com/secure/video/3002', 3200, 2, 0, '[{"type": "pdf", "title": "Isomerism Guide", "url": "https://example.com/notes/isomerism.pdf"}]'),
(9, 27, 'Alkanes and Alkenes', 'Properties, reactions, and mechanisms of hydrocarbons', 'https://example.com/secure/video/3003', 2800, 1, 0, '[{"type": "pdf", "title": "Hydrocarbon Reactions", "url": "https://example.com/notes/hydrocarbons.pdf"}]'),

(10, 28, 'Chemical Bonding - Lesson 1', 'Detailed explanation of ionic, covalent, and hybrid bonding with examples.', 'https://example.com/videos/course10_chapter28_lesson1.mp4', 740, 1, TRUE, '["chemical_bonding_notes.pdf", "bonding_diagrams.pptx"]'),
(10, 29, 'Periodic Table - Lesson 2', 'Trends in periodic properties: atomic size, ionization energy.', 'https://example.com/videos/course10_chapter29_lesson2.mp4', 575, 2, FALSE, '["periodic_trends_chart.pdf", "trends_exercise.pptx"]'),
(10, 30, 'Thermodynamics - Lesson 2', 'First law of thermodynamics, enthalpy changes.', 'https://example.com/videos/course10_chapter30_lesson2.mp4', 690, 2, FALSE, '["first_law_notes.pdf", "enthalpy_problems.xlsx"]');

INSERT INTO enrollments (user_id, course_id, enrolled_at, expires_at, progress_percentage, last_accessed, is_active, purchase_price, payment_method)
VALUES
(1, 1, DATETIME('now', '-30 days'), DATETIME('now', '+335 days'), 78.5, DATETIME('now', '-1 day'), TRUE, 3999, 'UPI'),
(1, 2, DATETIME('now', '-20 days'), DATETIME('now', '+160 days'), 52.0, DATETIME('now', '-2 days'), TRUE, 1999, 'Card'),
(6, 7, DATETIME('now', '-60 days'), DATETIME('now', '+210 days'), 90.0, DATETIME('now', '-5 days'), TRUE, 4299, 'NetBanking'),
(6, 8, DATETIME('now', '-15 days'), DATETIME('now', '+165 days'), 43.2, DATETIME('now', '-1 hour'), TRUE, 2499, 'UPI'),
(6, 9, DATETIME('now', '-5 days'), DATETIME('now', '+85 days'), 25.6, DATETIME('now', '-2 days'), TRUE, 2199, 'Wallet'),

(2, 5, DATETIME('now', '-10 days'), DATETIME('now', '+355 days'), 66.1, DATETIME('now', '-6 hours'), TRUE, 4499, 'UPI'),
(2, 6, DATETIME('now', '-20 days'), DATETIME('now', '+160 days'), 38.0, DATETIME('now', '-3 days'), TRUE, 3499, 'Card'),
(14, 5, DATETIME('now', '-18 days'), DATETIME('now', '+347 days'), 74.9, DATETIME('now', '-1 day'), TRUE, 4499, 'Card'),
(14, 10, DATETIME('now', '-7 days'), DATETIME('now', '+173 days'), 19.3, DATETIME('now', '-1 hour'), TRUE, 1600, 'UPI'),
(20, 6, DATETIME('now', '-12 days'), DATETIME('now', '+168 days'), 35.0, DATETIME('now', '-2 days'), TRUE, 3499, 'NetBanking'),

(3, 4, DATETIME('now', '-25 days'), DATETIME('now', '+340 days'), 88.8, DATETIME('now', '-3 days'), TRUE, 5999, 'UPI'),
(3, 3, DATETIME('now', '-50 days'), DATETIME('now', '+40 days'), 72.0, DATETIME('now', '-1 day'), TRUE, 3499, 'Card'),
(13, 3, DATETIME('now', '-10 days'), DATETIME('now', '+80 days'), 15.5, DATETIME('now', '-6 hours'), TRUE, 3499, 'UPI'),
(13, 4, DATETIME('now', '-30 days'), DATETIME('now', '+335 days'), 62.0, DATETIME('now', '-1 day'), TRUE, 5999, 'Card'),

(7, 5, DATETIME('now', '-22 days'), DATETIME('now', '+343 days'), 70.0, DATETIME('now', '-1 day'), TRUE, 4499, 'UPI'),
(7, 6, DATETIME('now', '-15 days'), DATETIME('now', '+165 days'), 40.5, DATETIME('now', '-3 days'), TRUE, 3499, 'Wallet'),
(15, 7, DATETIME('now', '-40 days'), DATETIME('now', '+250 days'), 82.0, DATETIME('now', '-4 days'), TRUE, 4299, 'Card'),
(18, 2, DATETIME('now', '-8 days'), DATETIME('now', '+172 days'), 23.0, DATETIME('now', '-1 hour'), TRUE, 1999, 'UPI'),
(17, 2, DATETIME('now', '-12 days'), DATETIME('now', '+168 days'), 45.0, DATETIME('now', '-2 days'), TRUE, 1999, 'NetBanking'),
(12, 1, DATETIME('now', '-5 days'), DATETIME('now', '+360 days'), 12.5, DATETIME('now', '-6 hours'), TRUE, 3999, 'UPI');


INSERT INTO watch_history (user_id, lesson_id, watched_duration, total_duration, completed, last_watched_at, created_at) VALUES
-- Aarav Sharma (JEE), enrolled in courses 1, 2, 7, 8
(1, 1, 700, 793, TRUE, '2024-06-17 10:00:00', '2024-06-17 10:00:00'),
(1, 2, 580, 625, TRUE, '2024-06-18 11:00:00', '2024-06-18 11:00:00'),
(1, 17, 620, 652, TRUE, '2024-06-19 10:00:00', '2024-06-19 10:00:00'),

-- Diya Mehta (NEET), enrolled in courses 5, 6, 11
(2, 19, 450, 490, TRUE, '2024-06-17 14:00:00', '2024-06-17 14:00:00'),
(2, 20, 300, 380, FALSE, '2024-06-18 15:00:00', '2024-06-18 15:00:00'),
(2, 35, 3000, 3600, TRUE, '2024-06-19 16:00:00', '2024-06-19 16:00:00'),

-- Rohan Gupta (CAT) → no matching lessons, skipped

-- Isha Roy (UPSC) → no matching lessons, skipped

-- Kabir Das (GATE) → enrolled in course 3, 4
(5, 10, 450, 457, TRUE, '2024-06-17 10:30:00', '2024-06-17 10:30:00'),
(5, 11, 530, 545, TRUE, '2024-06-18 10:30:00', '2024-06-18 10:30:00'),

-- Sneha Kapoor (JEE)
(6, 4, 700, 781, TRUE, '2024-06-17 11:00:00', '2024-06-17 11:00:00'),
(6, 25, 500, 619, TRUE, '2024-06-18 11:00:00', '2024-06-18 11:00:00'),

-- Aditya Verma (NEET)
(7, 21, 370, 376, TRUE, '2024-06-18 13:00:00', '2024-06-18 13:00:00'),
(7, 22, 430, 470, TRUE, '2024-06-19 13:30:00', '2024-06-19 13:30:00'),

-- Meera Iyer (UPSC) → no matching courses

-- Arjun Nair (CAT) → no matching lessons

-- Tanya Reddy (SSC) → no matching lessons

-- Dev Patel (Banking) → no matching lessons

-- Anaya Joshi (JEE)
(12, 5, 500, 753, FALSE, '2024-06-18 10:00:00', '2024-06-18 10:00:00'),
(12, 28, 600, 740, TRUE, '2024-06-19 10:00:00', '2024-06-19 10:00:00'),

-- Yash Thakur (GATE)
(13, 8, 850, 879, TRUE, '2024-06-17 10:00:00', '2024-06-17 10:00:00'),
(13, 13, 610, 652, TRUE, '2024-06-18 10:00:00', '2024-06-18 10:00:00'),

-- Sana Khan (UPSC) → skipped

-- Vikram Rao (NEET)
(15, 27, 2750, 2800, TRUE, '2024-06-19 12:00:00', '2024-06-19 12:00:00'),
(15, 31, 720, 740, TRUE, '2024-06-20 10:00:00', '2024-06-20 10:00:00'),

-- Pooja Jain (SSC) → no lessons

-- Nikhil Das (Banking) → no lessons

-- Reema Dutt (CAT) → skipped

-- Harshita Malhotra (JEE)
(19, 6, 560, 571, TRUE, '2024-06-18 14:00:00', '2024-06-18 14:00:00'),
(19, 24, 710, 710, TRUE, '2024-06-19 15:00:00', '2024-06-19 15:00:00'),

-- Aman Choudhary (NEET)
(20, 33, 690, 720, TRUE, '2024-06-17 17:00:00', '2024-06-17 17:00:00'),
(20, 34, 675, 690, TRUE, '2024-06-18 17:00:00', '2024-06-18 17:00:00');


-- Live Classes for Dr. Sarah Kumar (Physics)
INSERT INTO live_classes (course_id, educator_id, title, description, scheduled_at, duration_minutes, max_students, join_url, status)
VALUES
(1, 1, 'Mechanics Deep Dive', 'Understand Newtonian mechanics with problem-solving sessions.', '2025-06-25 10:00:00', 90, 300, 'https://zoom.example.com/physics1', 'scheduled'),
(2, 1, 'Quantum Concepts in Modern Physics', 'Explore quantum theory fundamentals for JEE.', '2025-06-27 17:00:00', 75, 250, 'https://zoom.example.com/modernphysics1', 'scheduled'),

(3, 2, 'Mastering Linked Lists & Trees', 'Hands-on coding with DSA structures.', '2025-06-28 14:00:00', 90, 500, 'https://zoom.example.com/dsa1', 'scheduled'),
(4, 2, 'Operating Systems & DBMS Overview', 'Get CS foundation concepts in depth.', '2025-07-01 15:00:00', 120, 500, 'https://zoom.example.com/csfoundation1', 'scheduled'),

(5, 3, 'Human Physiology: Respiratory System', 'Clinical approach to human physiology for NEET.', '2025-06-29 09:30:00', 60, 400, 'https://zoom.example.com/neetbio1', 'scheduled'),
(6, 3, 'NEET Medicine Crash: Basics to Advance', 'Foundation medicine concepts and doubts.', '2025-07-02 11:00:00', 75, 300, 'https://zoom.example.com/medicine1', 'scheduled'),

(7, 4, 'Probability and Permutations', 'Competitive math problem solving.', '2025-06-26 18:00:00', 60, 500, 'https://zoom.example.com/math1', 'scheduled'),
(8, 4, 'Algebra Simplified: Quadratic Equations', 'Algebra from basics with shortcuts.', '2025-06-30 20:00:00', 60, 350, 'https://zoom.example.com/algebra1', 'scheduled'),

(9, 5, 'JEE Chemistry: Important Organic Reactions', 'Understand mechanisms with examples.', '2025-07-03 10:00:00', 90, 400, 'https://zoom.example.com/jeechem1', 'scheduled'),
(10, 5, 'NEET Chemistry Formula Hacks', 'Quick formula derivations + problem solving.', '2025-07-05 16:00:00', 60, 300, 'https://zoom.example.com/neetchem1', 'scheduled');

-- Live class 1: Physics (JEE), attended by users enrolled in JEE courses
INSERT INTO live_class_attendance (live_class_id, user_id, joined_at, left_at, duration_minutes) VALUES
(1, 1, '2025-06-25 10:01:00', '2025-06-25 11:25:00', 84),
(1, 6, '2025-06-25 10:05:00', '2025-06-25 11:20:00', 75),
(1, 12, '2025-06-25 10:10:00', '2025-06-25 11:30:00', 80),

(2, 1, '2025-06-27 17:02:00', '2025-06-27 18:13:00', 71),
(2, 6, '2025-06-27 17:05:00', '2025-06-27 18:15:00', 70),

(3, 13, '2025-06-28 14:01:00', '2025-06-28 15:26:00', 85),
(3, 15, '2025-06-28 14:03:00', '2025-06-28 15:20:00', 77),

(4, 13, '2025-07-01 15:05:00', '2025-07-01 17:00:00', 115),

(5, 2, '2025-06-29 09:31:00', '2025-06-29 10:30:00', 59),
(5, 7, '2025-06-29 09:40:00', '2025-06-29 10:30:00', 50),
(5, 16, '2025-06-29 09:35:00', '2025-06-29 10:30:00', 55),

(6, 2, '2025-07-02 11:01:00', '2025-07-02 12:10:00', 69),
(6, 7, '2025-07-02 11:02:00', '2025-07-02 12:00:00', 58),

(7, 1, '2025-06-26 18:00:00', '2025-06-26 18:58:00', 58),
(7, 6, '2025-06-26 18:05:00', '2025-06-26 19:05:00', 60),

(8, 6, '2025-06-30 20:00:00', '2025-06-30 20:59:00', 59),
(8, 12, '2025-06-30 20:02:00', '2025-06-30 21:00:00', 58),

(9, 1, '2025-07-03 10:00:00', '2025-07-03 11:15:00', 75),
(9, 6, '2025-07-03 10:05:00', '2025-07-03 11:00:00', 55),

(10, 2, '2025-07-05 16:00:00', '2025-07-05 17:00:00', 60),
(10, 7, '2025-07-05 16:10:00', '2025-07-05 17:00:00', 50);

-- Physics Tests for JEE Course (course_id = 1)
INSERT INTO tests (course_id, title, description, type, subject, total_questions, duration_minutes, max_marks, negative_marking, difficulty, instructions) VALUES
(1, 'Mechanics Chapter Test 1', 'Test covering basic concepts in Mechanics', 'chapter', 'Physics', 25, 45, 100, TRUE, 'easy', 'Answer all questions.'),
(1, 'JEE Full Physics Mock Test 1', 'Mock test simulating JEE pattern', 'mock', 'Physics', 90, 180, 360, TRUE, 'hard', 'No calculators allowed.'),
(1, 'Modern Physics Practice', 'Practice test on modern physics problems', 'practice', 'Modern Physics', 30, 60, 120, TRUE, 'medium', 'Read all instructions carefully.'),

(10, 'Organic Chemistry Practice 1', 'Practice on reactions and mechanisms', 'practice', 'Organic Chemistry', 20, 30, 80, TRUE, 'medium', 'Attempt all questions.'),
(10, 'NEET Chemistry Full Mock 1', 'Simulated NEET chemistry section', 'mock', 'Chemistry', 45, 90, 180, TRUE, 'hard', 'Maintain time discipline.'),
(10, 'Hydrocarbons Chapter Test', 'Focused chapter test on hydrocarbons', 'chapter', 'Chemistry', 15, 20, 60, TRUE, 'easy', 'Use NCERT concepts.'),

(5, 'Cell Biology Chapter Test', 'Test on structure and function of cells', 'chapter', 'Biology', 20, 25, 80, TRUE, 'easy', 'All questions are mandatory.'),
(5, 'NEET Biology Mock Test 1', 'Complete biology mock test for NEET', 'mock', 'Biology', 90, 180, 360, TRUE, 'hard', 'Strictly no breaks.'),
(5, 'Human Physiology Practice', 'Practice questions on physiology', 'practice', 'Biology', 25, 40, 100, TRUE, 'medium', 'Focus on accuracy.'),

(7, 'Calculus Practice Set', 'Practice questions on integration and differentiation', 'practice', 'Mathematics', 30, 45, 120, TRUE, 'medium', 'Use formula sheets if needed.'),
(7, 'Math Full Mock 1', 'Mock test covering algebra, geometry, and calculus', 'mock', 'Mathematics', 60, 120, 240, TRUE, 'hard', 'Avoid skipping questions.'),
(7, 'Trigonometry Chapter Test', 'Focused test on trigonometric identities', 'chapter', 'Mathematics', 20, 30, 80, TRUE, 'easy', 'Use values from tables.'),

(3, 'Arrays and Strings Test', 'Chapter test on basic data structures', 'chapter', 'Data Structures', 25, 30, 100, FALSE, 'easy', 'All MCQs.'),
(3, 'Mock Interview Round 1', 'Simulated technical screening round', 'mock', 'Algorithms', 40, 60, 160, TRUE, 'hard', 'No IDE allowed.'),
(3, 'Recursion & Backtracking Practice', 'Practice test on recursion logic', 'practice', 'Algorithms', 20, 30, 80, TRUE, 'medium', 'Focus on dry runs.'),

(8, 'Algebra Mastery Practice Test', 'Covers key algebraic identities and equations', 'practice', 'Algebra', 25, 40, 100, TRUE, 'medium', 'Use scratchpad for calculations.'),
(8, 'Calculus Mock Test - Part I', 'Mock test covering limits, derivatives, and integrals', 'mock', 'Calculus', 35, 75, 140, TRUE, 'hard', 'Complete within the time limit.'),
(8, 'Quadratic Equations Chapter Test', 'Quick chapter-wise test on quadratic equations', 'chapter', 'Algebra', 15, 25, 60, TRUE, 'easy', 'Solve analytically.'),

(9, 'Reaction Mechanisms Practice Set', 'Practice test on common organic reaction mechanisms', 'practice', 'Chemistry', 20, 30, 80, TRUE, 'medium', 'Focus on accuracy.'),
(9, 'JEE Chemistry Mock Test - Booster', 'Full chemistry mock for quick JEE revision', 'mock', 'Chemistry', 40, 90, 160, TRUE, 'hard', 'Time-bound test.'),
(9, 'Periodic Table & Properties Test', 'Chapter test on periodicity and properties', 'chapter', 'Chemistry', 18, 25, 72, TRUE, 'easy', 'Use logic and memorized trends.'),

(4, 'Computer Networks Practice Test', 'Test covering OSI model, TCP/IP, etc.', 'practice', 'Computer Science', 30, 45, 120, TRUE, 'medium', 'No internet access during test.'),
(4, 'GATE CS Full Mock Test - 1', 'Mock test simulating GATE-level questions', 'mock', 'Computer Science', 65, 180, 300, TRUE, 'hard', 'GATE pattern scoring.'),
(4, 'Operating Systems Chapter Test', 'Focused test on OS concepts like scheduling', 'chapter', 'Computer Science', 20, 30, 80, TRUE, 'easy', 'Time-box your answers.');


INSERT INTO test_questions (test_id, question, options, correct_option, explanation, marks, negative_marks, subject, topic, difficulty) VALUES
(1, 'What is the SI unit of force?', '["Newton","Joule","Watt","Pascal"]', 0, 'Force in SI is measured in Newton (kg·m/s²).', 1, 0.25, 'Physics', 'Mechanics', 'easy'),
(1, 'A 2 kg object accelerated at 3 m/s². What is the force?', '["3 N","6 N","9 N","12 N"]', 2, 'F = m·a = 2×3 = 6 N (option index 1 is 6N).', 1, 0.25, 'Physics', 'Mechanics', 'easy'),
(2, 'In photoelectric effect, if frequency increases, the stopping potential ____.', '["Increases","Decreases","Remains same","Zero"]', 0, 'Higher frequency → higher kinetic energy → higher stopping potential.', 3, 0.75, 'Physics', 'Modern Physics', 'hard'),
(2, 'Which gas is used in the first law of thermodynamics experiment?', '["Helium","Oxygen","Nitrogen","Hydrogen"]', 0, 'Ideal conditions often use Helium due to inertness.', 3, 0.75, 'Physics', 'Thermodynamics', 'hard'),

(3, 'Photon has no ____.', '["Mass","Momentum","Energy","Frequency"]', 0, 'Photon has zero rest mass.', 2, 0.5, 'Modern Physics', 'Photon', 'medium'),
(3, 'Alpha decay emits ____.', '["Electron","Proton","Alpha particle","Neutron"]', 2, 'Alpha decay emits helium nuclei (alpha particles).', 2, 0.5, 'Modern Physics', 'Radioactivity', 'medium'),

(4, 'What is the functional group of alcohol?', '["-NH2","-OH","-COOH","-SH"]', 1, 'Alcohol contains hydroxyl group (-OH).', 1, 0.25, 'Organic Chemistry', 'Alcohols', 'medium'),
(4, 'SN2 reactions are ____ order.', '["First","Second","Zero","Third"]', 1, 'SN2 involves both substrate and nucleophile → second order.', 1, 0.25, 'Organic Chemistry', 'Reaction Mechanisms', 'medium'),

(5, 'What is the pH of neutral water at 25 °C?', '["6","7","8","7.4"]', 1, 'Neutral water pH at 25°C is 7.', 2, 0.5, 'Chemistry', 'General Chemistry', 'hard'),
(5, 'Name the orbital shape of d-orbital?', '["Circular","Dumbbell","Complex clover","Spherical"]', 2, 'd-orbitals have cloverleaf shapes.', 2, 0.5, 'Chemistry', 'Atomic Structure', 'hard'),

(6, 'Alkane general formula is ____.', '["CₙH₂ₙ","CₙH₂ₙ₊₂","CₙH₂ₙ₋₂","CₙHₙ"]', 1, 'Alkanes follow CₙH₂ₙ₊₂', 1, 0.25, 'Chemistry', 'Hydrocarbons', 'easy'),
(6, 'Which is saturated?', '["Alkene","Alkyne","Alkane","Allene"]', 2, 'Only alkanes are saturated hydrocarbons.', 1, 0.25, 'Chemistry', 'Hydrocarbons', 'easy'),
(7, 'Mitochondria produce ____.', '["Protein","ATP","DNA","RNA"]', 1, 'Mitochondria generate ATP.', 1, 0.25, 'Biology', 'Cell Biology', 'easy'),
(7, 'Cell wall is present in ____ cells.', '["Animal","Plant","Fungal","Bacterial"]', 1, 'Plant cells contain a cell wall made of cellulose.', 1, 0.25, 'Biology', 'Cell Biology', 'easy'),

(8, 'Which blood type is universal donor?', '["A","B","AB","O"]', 3, 'O negative is universal donor.', 3, 0.75, 'Biology', 'Human Physiology', 'hard'),
(8, 'Which organ filters blood?', '["Heart","Kidney","Liver","Lungs"]', 1, 'Kidneys filter blood to produce urine.', 3, 0.75, 'Biology', 'Human Physiology', 'hard'),

(9, 'Derivative of sin(x) is ____.', '["cos(x)","-sin(x)","tan(x)","sin(x)"]', 0, 'd/dx [sin x] = cos x', 1, 0.25, 'Mathematics', 'Calculus', 'medium'),
(9, '∫ x dx equals ____.', '["x^2/2 + C","x + C","1/x + C","ln x + C"]', 0, 'Integral of x is x²/2 + C.', 1, 0.25, 'Mathematics', 'Calculus', 'medium'),

(10, 'Solve: |x| = 2, x = ____.', '["±2","2 only","-2 only","0"]', 0, 'Absolute yields ±2.', 2, 0.5, 'Mathematics', 'Algebra', 'hard'),
(10, 'If f(x)=x², f(3)= ____.', '["6","3","9","None"]', 0, 'Derivative of x² at 3 is 6.', 2, 0.5, 'Mathematics', 'Calculus', 'hard');
(11, 'Which index starts arrays?', '["0","1","-1","Depends"]', 0, 'C-based arrays start at 0.', 1, 0, 'Data Structures', 'Arrays', 'easy'),
(11, 'String "abc" length = ____.', '["2","3","4","None"]', 1, 'Length includes 3 characters.', 1, 0, 'Data Structures', 'Strings', 'easy'),

(12, 'Time complexity of binary search?', '["O(n)","O(n log n)","O(log n)","O(1)"]', 2, 'Binary search runs in O(log n).', 3, 0.75, 'Algorithms', 'Searching', 'hard'),
(12, 'Which is stable sort?', '["Merge Sort","Quick Sort","Heap Sort","Selection Sort"]', 0, 'Merge sort is stable; quick sort is not.', 3, 0.75, 'Algorithms', 'Sorting', 'hard'),

(13, 'Recursion base case avoids ____.', '["Infinite loop","Memory leak","Stack overflow","None"]', 2, 'Missing base case leads to stack overflow.', 2, 0.5, 'Algorithms', 'Recursion', 'medium'),
(13, 'Backtracking is used in ____?', '["Greedy","Branch & Bound","Brute Force","DFS"]', 3, 'Used in depth-first search patterns.', 2, 0.5, 'Algorithms', 'Backtracking', 'medium'),

(20, 'OSI model has ____ layers.', '["5", "6", "7", "8"]', 2, 'OSI has seven layers.', 2, 0.5, 'Computer Science', 'Networking', 'medium'),
(20, 'IP address is ____ bits.', '["16", "32", "64", "128"]', 1, 'IPv4 uses 32-bit addresses.', 2, 0.5, 'Computer Science', 'Networking', 'medium'),

(21, 'Time complexity of BFS?', '["O(V+E)", "O(V²)", "O(E²)", "O(log V)"]', 0, 'Breadth-first search is O(V+E).', 3, 0.75, 'Computer Science', 'Algorithms', 'hard'),
(21, 'Which data structure uses LIFO?', '["Queue", "Stack", "Tree", "Graph"]', 1, 'Stack uses LIFO principle.', 3, 0.75, 'Computer Science', 'Data Structures', 'hard'),

(22, 'Which scheduling is non-preemptive?', '["Round Robin", "FCFS", "Priority", "Multilevel"]', 1, 'First‑come‑first‑serve is non-preemptive.', 2, 0.5, 'Computer Science', 'OS Scheduling', 'easy'),
(22, 'Deadlock requires ____ conditions.', '["2", "3", "4", "5"]', 2, "There's 4 Coffman conditions.", 2, 0.5, 'Computer Science', 'OS Deadlock', 'easy'),

(17, 'SN1 reaction involves ____ step.', '["One", "Two", "Three", "Four"]', 1, 'SN1 mechanism is two-step.', 2, 0.5, 'Chemistry', 'Reaction Mechanisms', 'medium'),
(17, 'Which is nucleophile in SN2?', '["CH₃⁺", "OH⁻", "H⁺", "Cl⁻"]', 1, 'OH⁻ acts as nucleophile.', 2, 0.5, 'Chemistry', 'Reaction Mechanisms', 'medium'),

(18, 'What is the hybridization of carbon in CH₄?', '["sp", "sp²", "sp³", "sp³d"]', 2, 'Methane has sp³ hybridization.', 2, 0.5, 'Chemistry', 'General Chemistry', 'hard'),
(18, 'pKa of acetic acid approximately?', '["4.76", "7.00", "2.34", "5.30"]', 0, 'Acetic acid pKa ≈ 4.76.', 2, 0.5, 'Chemistry', 'Acid-Base', 'hard'),

(19, 'Atomic radius ____ down a group.', '["Increases", "Decreases", "Same", "Varies"]', 0, 'Shielding increases down, radius increases.', 1, 0.25, 'Chemistry', 'Periodic Properties', 'easy'),
(19, 'Ionization energy ____ across a period.', '["Increases", "Decreases", "Same", "Varies"]', 0, 'Nuclear charge increases across, IE increases.', 1, 0.25, 'Chemistry', 'Periodic Properties', 'easy'),

(14, 'If x + 1/x = 5, find x² + 1/x².', '["23", "24", "22", "21"]', 0, 'Square: 25 – 2 = 23.', 2, 0.5, 'Algebra', 'Quadratics', 'medium'),
(14, 'Expand (a + b)³.', '["a³ + b³", "a³ + 3a²b + 3ab² + b³", "a³ + b³ + 3ab", "None"]', 1, 'Binomial expansion.', 2, 0.5, 'Algebra', 'Binomial Theorem', 'medium'),

(15, '∫ 1/x dx = ?', '["ln|x| + C", "x²/2 + C", "eˣ + C", "x + C"]', 0, 'Integral of 1/x is ln|x| + C.', 2, 0.5, 'Calculus', 'Integration', 'hard'),
(15, 'd/dx eˣ = ?', '["eˣ", "x·eˣ", "eˣ+1", "1"]', 0, 'Derivative of eˣ is eˣ.', 2, 0.5, 'Calculus', 'Differentiation', 'hard'),

(16, 'Sum of roots of x² – 5x + 6 = 0 is ____.', '["5", "6", "–6", "2"]', 0, 'Sum = 5.', 1, 0.25, 'Algebra', 'Quadratic Equations', 'easy'),
(16, 'Product of roots of x² – 5x + 6 = 0 is ____.', '["5", "6", "–6", "2"]', 1, 'Product = 6.', 1, 0.25, 'Algebra', 'Quadratic Equations', 'easy');


INSERT INTO test_attempts (
  user_id, test_id, session_id, started_at, submitted_at, time_spent_seconds, total_score,
  max_score, percentage, rank_position, percentile, answers, analysis, status
) VALUES
(1, 2, 'sess-1001', '2025-06-15 10:00:00', '2025-06-15 12:55:00', 10500, 287, 360, 79.7, 12, 92.5,
 '{"1":2,"2":1,"3":3}', '{"Physics": {"correct": 72, "incorrect": 18, "unattempted": 0}}', 'submitted'),

(2, 10, 'sess-1002', '2025-06-16 09:30:00', '2025-06-16 10:00:00', 1800, 64, 80, 80.0, 5, 97.0,
 '{"1":1,"2":2,"3":3}', '{"Chemistry": {"correct": 16, "incorrect": 2, "unattempted": 2}}', 'submitted'),


(3, 7, 'sess-1003', '2025-06-17 17:00:00', NULL, 1200, 0, 80, 0.0, NULL, NULL,
 '{}', '{}', 'started'),

(4, 14, 'sess-1004', '2025-06-18 14:00:00', '2025-06-18 14:40:00', 2400, 83, 100, 83.0, 3, 98.6,
 '{"1":1,"2":2}', '{"Algebra": {"correct": 20, "incorrect": 2, "unattempted": 3}}', 'submitted'),

(5, 21, 'sess-1005', '2025-06-19 08:00:00', '2025-06-19 11:00:00', 10800, 222, 300, 74.0, 20, 90.0,
 '{"1":2,"2":2,"3":1}', '{"Computer Science": {"correct": 50, "incorrect": 10, "unattempted": 5}}', 'submitted'),

(1, 8, 'sess-1006', '2025-06-14 09:00:00', '2025-06-14 11:30:00', 9000, 301, 360, 83.6, 2, 99.2,
 '{"1":3,"2":2,"3":4}', '{"Biology": {"correct": 78, "incorrect": 6, "unattempted": 6}}', 'submitted'),

(2, 15, 'sess-1007', '2025-06-20 15:00:00', NULL, 500, 0, 80, 0.0, NULL, NULL,
 '{}', '{}', 'started'),

(3, 19, 'sess-1008', '2025-06-13 17:00:00', '2025-06-13 17:25:00', 1500, 68, 72, 94.4, 1, 100.0,
 '{"1":1,"2":1}', '{"Chemistry": {"correct": 17, "incorrect": 1, "unattempted": 0}}', 'submitted'),

(5, 20, 'sess-1009', '2025-06-12 10:00:00', '2025-06-12 10:40:00', 2400, 102, 120, 85.0, 8, 95.0,
 '{"1":2,"2":1}', '{"Computer Science": {"correct": 25, "incorrect": 3, "unattempted": 2}}', 'submitted'),

(4, 16, 'sess-1010', '2025-06-11 19:30:00', NULL, 700, 0, 60, 0.0, NULL, NULL,
 '{}', '{}', 'started'),

(6, 1, 'sess-1011', '2025-06-20 13:00:00', '2025-06-20 13:45:00', 2700, 18, 25, 72.0, 4, 95.0,
 '{"1":0,"2":2}', '{"Physics": {"correct":18,"incorrect":7,"unattempted":0}}', 'submitted'),

(7, 9, 'sess-1012', '2025-06-21 10:15:00', '2025-06-21 10:55:00', 2400, 22, 30, 73.3, 6, 88.2,
 '{"1":0,"2":0}', '{"Biology": {"correct":22,"incorrect":8,"unattempted":0}}', 'submitted'),

(12, 2, 'sess-1013', '2025-06-19 08:00:00', '2025-06-19 10:50:00', 10200, 312, 360, 86.7, 2, 98.5,
 '{"1":2,"2":3}', '{"Physics": {"correct":104,"incorrect":6,"unattempted":0}}', 'submitted');


INSERT INTO subscription_plans (
    name, description, price, duration_days, features, max_courses, priority_support, offline_download, is_active
) VALUES
(
    'Plus',
    'Monthly plan with access to all Plus courses and features.',
    999,
    30,
    '[
        "Access to all Plus courses",
        "Live classes",
        "Doubt clearing sessions",
        "Test series"
    ]',
    10,
    FALSE,
    TRUE,
    TRUE
),
(
    'Iconic',
    'Premium monthly plan with personal mentorship and top educator access.',
    2999,
    30,
    '[
        "Everything in Plus",
        "Top educator courses",
        "Personal mentorship",
        "Priority doubt solving"
    ]',
    20,
    TRUE,
    TRUE,
    TRUE
),
(
    'Free',
    'Access to a limited set of free courses and resources.',
    0,
    0,
    '[
        "Access to selected free courses",
        "Limited live classes",
        "Basic test series"
    ]',
    3,
    FALSE,
    FALSE,
    TRUE
);

-- User 1 (Aarav Sharma): Enrolled in live (courses 1,2,7,8,9) → Iconic
INSERT INTO user_subscriptions (user_id, plan_id, started_at, expires_at, is_active, payment_amount, payment_method, payment_id, auto_renewal)
VALUES (1, 3, '2025-05-01 09:00:00', '2025-05-31 09:00:00', TRUE, 2999, 'credit_card', 'pay_ABC123', TRUE);

INSERT INTO user_subscriptions VALUES (NULL, 2, 2, '2025-05-10 10:00:00', '2025-06-09 10:00:00', TRUE, 999, 'debit_card', 'pay_DEF456', FALSE);

INSERT INTO user_subscriptions VALUES (NULL, 3, 1, '2025-01-01 08:00:00', '9999-12-31 00:00:00', TRUE, 0, NULL, NULL, FALSE),

(NULL, 5, 2, '2025-04-15 11:00:00', '2025-05-15 11:00:00', FALSE, 999, 'upi', 'pay_GHI789', FALSE),
(NULL, 6, 2, '2025-03-20 14:00:00', '2025-04-19 14:00:00', FALSE, 999, 'credit_card', 'pay_JKL012', FALSE),

(NULL, 7, 2, '2025-06-01 09:30:00', '2025-07-01 09:30:00', TRUE, 999, 'netbanking', 'pay_MNO345', TRUE),
(NULL, 12, 3, '2025-02-01 10:00:00', '2025-01-31 10:00:00', FALSE, 2999, 'upi', 'pay_PQR678', FALSE),

(NULL, 13, 1, '2024-12-01 08:00:00', '9999-12-31 00:00:00', TRUE, 0, NULL, NULL, FALSE),

(NULL, 15, 2, '2025-05-20 12:00:00', '2025-06-19 12:00:00', TRUE, 999, 'credit_card', 'pay_STU901', TRUE);


-- Doubts/Questions Insert Data

INSERT INTO doubts (user_id, course_id, lesson_id, question, attachments, status, priority, created_at, updated_at) VALUES

(1, 1, 1, 'Why is acceleration due to gravity constant on Earth?', '["https://cdn.example.com/uploads/doubt1.png"]', 'pending', 'normal', '2025-06-01 10:00:00', '2025-06-01 10:00:00'),

(2, 5, 12, 'What is the function of mitochondria in plant cells?', NULL, 'answered', 'low', '2025-06-02 09:15:00', '2025-06-02 10:30:00'),

(3, 4, 85, 'Can you explain how paging works in operating systems?', '["https://cdn.example.com/uploads/os_paging_diagram.png"]', 'resolved', 'high', '2025-05-25 14:40:00', '2025-05-26 08:00:00'),

(5, 3, 65, 'Why do we prefer binary search over linear search?', NULL, 'answered', 'normal', '2025-06-03 13:20:00', '2025-06-03 13:45:00'),

(6, 2, 25, 'Can someone explain dual nature of matter with a real-life example?', '["https://cdn.example.com/uploads/electron_wave.jpg"]', 'pending', 'high', '2025-06-04 12:30:00', '2025-06-04 12:30:00'),

(7, 5, 15, 'How does osmosis differ from diffusion in cells?', NULL, 'resolved', 'normal', '2025-06-05 17:10:00', '2025-06-05 18:00:00'),

(13, 4, 90, 'Why is multithreading important in modern applications?', NULL, 'answered', 'normal', '2025-05-18 11:55:00', '2025-05-18 12:10:00'),

(15, 10, 130, 'What are the important mechanisms in SN1 and SN2 reactions?', '["https://cdn.example.com/uploads/sn1-vs-sn2.pdf"]', 'pending', 'high', '2025-06-06 08:45:00', '2025-06-06 08:45:00'),

(12, 1, 5, 'Why do we consider pseudo forces in non-inertial frames?', NULL, 'pending', 'normal', '2025-06-07 10:05:00', '2025-06-07 10:05:00'),

(15, 10, 135, 'Can you explain the Markovnikov’s rule with an example?', '["https://cdn.example.com/uploads/markovnikov.jpg"]', 'answered', 'high', '2025-06-08 11:30:00', '2025-06-08 12:00:00'),

(6, 2, 28, 'How does photoelectric effect prove particle nature of light?', NULL, 'resolved', 'normal', '2025-06-08 13:15:00', '2025-06-08 14:10:00'),

(5, 3, 67, 'What’s the difference between stack memory and heap memory?', NULL, 'pending', 'normal', '2025-06-09 09:45:00', '2025-06-09 09:45:00'),

(7, 5, 20, 'How does mitosis differ from meiosis in terms of outcome?', '["https://cdn.example.com/uploads/mitosis-vs-meiosis.png"]', 'answered', 'medium', '2025-06-10 15:30:00', '2025-06-10 16:00:00'),

(2, 6, 95, 'What is the function of the hypothalamus in the human body?', NULL, 'pending', 'normal', '2025-06-10 17:00:00', '2025-06-10 17:00:00'),

(3, 4, 92, 'Explain the differences between compiler and interpreter.', NULL, 'resolved', 'low', '2025-06-11 10:10:00', '2025-06-11 10:45:00'),

(13, 4, 91, 'Is TCP faster than UDP? Why use TCP for HTTP?', NULL, 'answered', 'normal', '2025-06-11 12:50:00', '2025-06-11 13:20:00'),

(1, 8, 111, 'How do you solve cubic equations using factorization?', NULL, 'pending', 'normal', '2025-06-12 11:20:00', '2025-06-12 11:20:00'),

(7, 5, 18, 'What is the difference between pulmonary and systemic circulation?', '["https://cdn.example.com/uploads/circulation.png"]', 'resolved', 'normal', '2025-06-13 10:30:00', '2025-06-13 11:00:00');


-- Doubt Answers

INSERT INTO doubt_answers (doubt_id, educator_id, answer, attachments, is_accepted, upvotes, downvotes, created_at) VALUES

(1, 1, 'Acceleration due to gravity is constant near Earth because the change in distance is negligible compared to the Earth’s radius.', NULL, TRUE, 12, 0, '2025-06-01 11:30:00'),

(2, 5, 'Mitochondria are the powerhouse of the cell, generating ATP through cellular respiration.', '["https://cdn.example.com/uploads/mitochondria_diagram.png"]', TRUE, 8, 0, '2025-06-02 10:45:00'),

(3, 7, 'Paging allows non-contiguous memory allocation, improving utilization and reducing fragmentation.', NULL, TRUE, 10, 1, '2025-05-26 09:00:00'),

(4, 6, 'Binary search is more efficient (O(log n)) but requires sorted data. Linear search works on unsorted data.', NULL, TRUE, 5, 0, '2025-06-03 14:00:00'),

(5, 1, 'Photoelectric effect shows that light has particle nature since electrons are emitted only when a threshold frequency is met.', '["https://cdn.example.com/uploads/photoelectric_effect.png"]', TRUE, 9, 0, '2025-06-04 13:00:00'),

(6, 5, 'Osmosis is the movement of water across a semipermeable membrane, while diffusion involves all molecules.', NULL, TRUE, 7, 0, '2025-06-05 18:15:00'),

(7, 7, 'Multithreading improves performance by parallelizing tasks on multi-core CPUs.', NULL, TRUE, 6, 0, '2025-05-18 12:15:00'),

(8, 7, 'Compiler translates the whole code before execution, interpreter runs it line-by-line.', NULL, TRUE, 4, 1, '2025-06-11 11:00:00'),

(9, 7, 'TCP is reliable and ordered, ideal for HTTP. UDP is faster but doesn’t guarantee delivery.', NULL, TRUE, 3, 0, '2025-06-11 13:30:00'),

(10, 2, 'To solve cubics, factor by grouping or use Rational Root Theorem to find real roots first.', NULL, FALSE, 2, 0, '2025-06-12 12:00:00');


INSERT INTO study_materials (course_id, chapter_id, title, description, type, file_url, file_size, download_count, is_downloadable, requires_subscription, created_at) VALUES
(1, 1, 'Mechanics Lecture Notes', 'Complete notes on Newtons Laws and Motion', 'pdf', 'https://cdn.example.com/files/mechanics_notes.pdf', 2048, 120, TRUE, FALSE, '2025-06-01 10:00:00'),

(1, 1, 'Mechanics Concept Video', 'Visual explanation of projectile motion', 'video', 'https://cdn.example.com/videos/mechanics_projectile.mp4', 105000, 85, TRUE, TRUE, '2025-06-02 12:30:00'),

(10, 14, 'Hydrocarbons Quick Revision', 'Revision PDF for Hydrocarbon reactions', 'pdf', 'https://cdn.example.com/files/hydrocarbons_revision.pdf', 1024, 92, TRUE, FALSE, '2025-06-03 09:00:00'),

(10, 14, 'Hydrocarbon Mechanisms Video', 'In-depth explanation of reaction pathways', 'video', 'https://cdn.example.com/videos/hydrocarbon_mechanisms.mp4', 88000, 54, TRUE, TRUE, '2025-06-03 15:00:00'),

(5, 12, 'Cell Structure Diagram', 'Labelled diagram of eukaryotic cells', 'document', 'https://cdn.example.com/files/cell_structure.docx', 512, 70, TRUE, FALSE, '2025-06-04 11:30:00'),

(5, 12, 'Cell Organelles Audio Summary', 'Audio lecture on functions of organelles', 'audio', 'https://cdn.example.com/audio/cell_audio_summary.mp3', 20480, 45, TRUE, FALSE, '2025-06-04 14:10:00'),

(3, 18, 'Recursion Code Examples', 'Code snippets for basic recursion problems', 'pdf', 'https://cdn.example.com/files/recursion_examples.pdf', 1536, 33, TRUE, FALSE, '2025-06-05 10:45:00'),

(3, 18, 'Backtracking Demo Video', 'Visual walk-through of N-Queens & Sudoku', 'video', 'https://cdn.example.com/videos/backtracking_demo.mp4', 97000, 29, TRUE, TRUE, '2025-06-05 16:20:00'),

(7, 21, 'Trigonometry Identities Sheet', 'One-page formula cheat sheet', 'pdf', 'https://cdn.example.com/files/trig_identities_sheet.pdf', 300, 101, TRUE, FALSE, '2025-06-06 08:00:00'),

(7, 21, 'Trigonometric Ratios Video', 'Understanding sin, cos, tan visually', 'video', 'https://cdn.example.com/videos/trig_ratios_explained.mp4', 45000, 88, TRUE, TRUE, '2025-06-06 10:30:00'),

(10, 14, 'Hydrocarbon Reaction Maps', 'Premium summary map for reaction flow', 'pdf', 'https://cdn.example.com/files/premium_hydrocarbon_map.pdf', 1100, 12, TRUE, TRUE, '2025-06-10 11:00:00'),

(5, 12, 'Cell Biology Audio Booster', 'Podcast-style review of cell organelles', 'audio', 'https://cdn.example.com/audio/cell_biology_podcast.mp3', 30000, 8, TRUE, FALSE, '2025-06-10 08:30:00'),

(4, 17, 'Scheduling Algorithms Summary', 'Doc with examples of RR, FCFS, SJF', 'document', 'https://cdn.example.com/files/scheduling_summary.docx', 720, 42, TRUE, TRUE, '2025-06-10 09:15:00'),

(1, 1, 'JEE Physics Mock 1 Solutions', 'Step-by-step answers with formulas', 'pdf', 'https://cdn.example.com/files/mock1_physics_solutions.pdf', 1800, 61, TRUE, TRUE, '2025-06-10 14:20:00'),

(7, 21, 'Maths Mock Solutions - Part I', 'Worked answers with shortcuts', 'pdf', 'https://cdn.example.com/files/mock1_math_solutions.pdf', 1400, 73, TRUE, TRUE, '2025-06-10 15:00:00'),

(3, 18, 'Advanced Recursion Practice PDF', 'Exclusive dry run + trace table practice', 'pdf', 'https://cdn.example.com/files/recursion_dry_run_pro.pdf', 950, 15, TRUE, TRUE, '2025-06-10 13:40:00'),

(9, 14, 'Periodic Table Printable', 'Color-coded printable periodic table with tips', 'document', 'https://cdn.example.com/files/periodic_printable.docx', 600, 104, TRUE, FALSE, '2025-06-10 16:00:00'),

(7, 21, 'Algebra Tricks Audio Guide', 'Tips & mnemonics for fast calculations', 'audio', 'https://cdn.example.com/audio/algebra_tricks.mp3', 25000, 33, TRUE, FALSE, '2025-06-10 17:00:00');


INSERT INTO material_downloads (user_id, material_id, downloaded_at) VALUES
(1, 1, '2025-06-01 11:00:00'),  
(1, 2, '2025-06-01 11:30:00'),  
(6, 15, '2025-06-10 16:30:00'), 
(2, 5, '2025-06-04 12:00:00'),  
(2, 6, '2025-06-04 12:30:00'), 
(7, 12, '2025-06-10 09:00:00'), 
(5, 8, '2025-06-05 16:30:00'),  
(13, 14, '2025-06-10 17:30:00'),
(13, 13, '2025-06-10 10:00:00'),
(3, 7, '2025-06-06 10:00:00'),  
(3, 16, '2025-06-10 14:00:00'), 
(15, 3, '2025-06-03 10:15:00'), 
(15, 11, '2025-06-10 11:30:00'),
(1, 9, '2025-06-06 08:45:00'),  
(1, 10, '2025-06-06 11:00:00');


INSERT INTO course_reviews (user_id, course_id, rating, review, is_verified_purchase, helpful_count, created_at, updated_at) VALUES
(1, 1, 5, 'Excellent teaching and well-paced. Loved the live sessions!', TRUE, 12, '2025-06-05 10:00:00', '2025-06-05 10:00:00'),
(1, 7, 4, 'Good math course, though examples could be deeper.', TRUE, 6, '2025-06-06 11:30:00', '2025-06-06 11:30:00'),
(2, 5, 5, 'Biology explanations were crystal clear. Helped in NEET prep.', TRUE, 8, '2025-06-07 09:45:00', '2025-06-07 09:45:00'),
(5, 3, 4, 'The recursion part was strong. Could use more challenges.', TRUE, 4, '2025-06-08 14:00:00', '2025-06-08 14:00:00'),
(6, 1, 5, 'Physics made easy. Especially liked the projectile motion video.', TRUE, 9, '2025-06-08 17:00:00', '2025-06-08 17:00:00'),
(7, 5, 4, 'Cell Biology chapter was very engaging and informative.', TRUE, 3, '2025-06-09 08:30:00', '2025-06-09 08:30:00'),
(13, 4, 3, 'Good content, but mostly recorded. Would prefer more interactivity.', FALSE, 2, '2025-06-10 10:20:00', '2025-06-10 10:20:00'),
(15, 10, 5, 'Organic chemistry doubts were cleared so well!', TRUE, 5, '2025-06-10 13:45:00', '2025-06-10 13:45:00'),
(12, 1, 4, 'Repeated some topics from high school but still useful.', TRUE, 1, '2025-06-11 11:00:00', '2025-06-11 11:00:00'),
(3, 3, 4, 'Great course for brushing up recursion and logic.', FALSE, 3, '2025-06-11 15:10:00', '2025-06-11 15:10:00');


INSERT INTO educator_followers (user_id, educator_id, followed_at) VALUES
(1, 1, '2025-05-01 10:00:00'),  
(1, 4, '2025-05-01 10:30:00'),  
(2, 2, '2025-05-10 11:00:00'),  
(3, 6, '2025-01-05 09:20:00'), 
(5, 5, '2025-04-15 12:00:00'),  
(6, 1, '2025-03-21 10:10:00'), 
(7, 2, '2025-06-01 11:45:00'),  
(12, 1, '2025-02-01 09:30:00'), 
(13, 6, '2024-12-05 14:00:00'), 
(15, 3, '2025-05-20 12:30:00'); 


INSERT INTO lesson_notes (user_id, lesson_id, timestamp_seconds, note, created_at, updated_at) VALUES

(1, 1001, 90, 'Free body diagram explained clearly here.', '2025-06-01 10:05:00', '2025-06-01 10:05:00'),
(1, 1001, 360, 'Important: Inclined plane friction trick at this timestamp.', '2025-06-01 10:15:00', '2025-06-01 10:15:00'),

(2, 1006, 120, 'Endoplasmic reticulum types mentioned here.', '2025-06-03 09:10:00', '2025-06-03 09:10:00'),
(2, 1006, 480, 'Golgi body function breakdown — very concise.', '2025-06-03 09:18:00', '2025-06-03 09:18:00'),

(5, 1012, 200, 'Base case discussion and dry run starts.', '2025-06-05 16:00:00', '2025-06-05 16:00:00'),
(5, 1012, 540, 'N-Queens explanation and constraints — remember this.', '2025-06-05 16:09:00', '2025-06-05 16:09:00'),

(6, 1001, 150, 'Newtons 2nd Law F=ma — example with elevator.', '2025-06-06 08:30:00', '2025-06-06 08:30:00'),

(7, 1006, 240, 'Plasma membrane model differences highlighted.', '2025-06-07 11:00:00', '2025-06-07 11:00:00'),

(12, 1001, 300, 'Pulley trick with 2 masses — mark this.', '2025-06-08 14:20:00', '2025-06-08 14:20:00'),

(15, 1010, 180, 'Named reaction: Cannizzaro explained.', '2025-06-09 10:00:00', '2025-06-09 10:00:00'),

(3, 1012, 100, 'Recursive stack trace idea visualized.', '2025-06-04 17:00:00', '2025-06-04 17:00:00'),

(13, 1015, 120, 'FCFS vs SJF scheduling logic starts here.', '2025-06-03 11:00:00', '2025-06-03 11:00:00');


INSERT INTO user_achievements (user_id, achievement_type, achievement_data, earned_at) VALUES

(1, 'course_completion', '{"course_id": 1, "course_title": "JEE Physics", "completion_percentage": 100}', '2025-06-10 10:00:00'),
(1, 'test_score', '{"test_id": 1, "title": "Mechanics Chapter Test 1", "score": 92, "max_score": 100}', '2025-06-10 10:10:00'),
(1, 'streak', '{"days": 7, "label": "7-Day Learning Streak"}', '2025-06-11 09:00:00'),

(2, 'streak', '{"days": 30, "label": "30-Day Champion"}', '2025-06-12 10:00:00'),
(2, 'test_score', '{"test_id": 7, "title": "Cell Biology Chapter Test", "score": 75, "max_score": 80}', '2025-06-12 11:00:00'),

(3, 'course_completion', '{"course_id": 3, "course_title": "Data Structures", "completion_percentage": 95}', '2025-06-09 15:30:00'),
(3, 'test_score', '{"test_id": 15, "title": "Recursion & Backtracking Practice", "score": 70, "max_score": 80}', '2025-06-09 16:00:00'),

(5, 'streak', '{"days": 10, "label": "10-Day Focused Learner"}', '2025-06-11 13:00:00'),

(6, 'streak', '{"days": 3, "label": "Getting Started"}', '2025-06-08 08:00:00'),

(7, 'test_score', '{"test_id": 8, "title": "NEET Biology Mock Test 1", "score": 315, "max_score": 360}', '2025-06-12 11:45:00'),

(12, 'course_completion', '{"course_id": 1, "course_title": "JEE Physics", "completion_percentage": 100}', '2025-06-14 14:00:00'),

(13, 'course_completion', '{"course_id": 4, "course_title": "GATE Computer Science", "completion_percentage": 100}', '2025-06-13 12:30:00'),

(15, 'test_score', '{"test_id": 4, "title": "Organic Chemistry Practice 1", "score": 68, "max_score": 80}', '2025-06-12 14:00:00'),

(1, 'test_score', '{"test_id": 2, "title": "JEE Full Physics Mock Test 1", "score": 325, "percentile": 98}', '2025-06-15 11:00:00'),
(7, 'test_score', '{"test_id": 8, "title": "NEET Biology Mock Test 1", "score": 345, "percentile": 96}', '2025-06-15 12:30:00'),

(2, 'doubt_contributor', '{"total_doubts_asked": 8, "resolved": 7}', '2025-06-14 13:00:00'),
(3, 'doubt_contributor', '{"total_doubts_asked": 5, "resolved": 5}', '2025-06-13 10:45:00'),
(5, 'doubt_contributor', '{"total_doubts_asked": 10, "resolved": 8}', '2025-06-12 16:00:00'),

(1, 'material_usage', '{"downloads": 10, "most_downloaded_type": "video"}', '2025-06-13 10:00:00'),
(15, 'material_usage', '{"downloads": 5, "most_downloaded_type": "pdf"}', '2025-06-14 11:30:00'),
(6, 'material_usage', '{"downloads": 7, "most_downloaded_type": "document"}', '2025-06-14 09:45:00'),

(12, 'speedster', '{"test_id": 2, "title": "JEE Full Physics Mock Test 1", "time_taken": "55 mins"}', '2025-06-15 15:00:00'),
(13, 'speedster', '{"test_id": 23, "title": "Operating Systems Chapter Test", "time_taken": "18 mins"}', '2025-06-14 17:00:00'),

(3, 'weekly_champion', '{"week": "June 1–7", "tests_attempted": 4}', '2025-06-08 08:00:00'),
(1, 'weekly_champion', '{"week": "June 8–14", "streak_days": 7, "materials_viewed": 12}', '2025-06-15 09:00:00');


-- 👤 Logins
INSERT INTO user_analytics (user_id, event_type, event_data, timestamp) VALUES
(1, 'login', '{"ip": "192.168.1.2", "device": "Chrome on Windows"}', '2025-06-01 08:00:00'),
(2, 'login', '{"ip": "192.168.1.3", "device": "Safari on iPhone"}', '2025-06-01 08:15:00'),
(3, 'login', '{"ip": "192.168.1.4", "device": "Firefox on Linux"}', '2025-06-02 09:00:00');

-- 📹 Video Watch
INSERT INTO user_analytics (user_id, event_type, event_data, timestamp) VALUES
(1, 'video_watch', '{"video_title": "Mechanics Concept Video", "course_id": 1, "duration_watched_sec": 1050}', '2025-06-02 12:35:00'),
(5, 'video_watch', '{"video_title": "Cell Organelles Audio Summary", "course_id": 5, "duration_watched_sec": 980}', '2025-06-04 14:15:00'),
(6, 'video_watch', '{"video_title": "JEE Physics Mock 1 Solutions", "course_id": 1, "duration_watched_sec": 1120}', '2025-06-05 11:00:00');

-- 🧪 Test Attempts
INSERT INTO user_analytics (user_id, event_type, event_data, timestamp) VALUES
(1, 'test_attempt', '{"test_id": 2, "score": 325, "time_spent_sec": 6540}', '2025-06-10 10:30:00'),
(7, 'test_attempt', '{"test_id": 8, "score": 345, "time_spent_sec": 6780}', '2025-06-10 11:15:00'),
(12, 'test_attempt', '{"test_id": 2, "score": 318, "time_spent_sec": 5700}', '2025-06-11 15:00:00');

-- 📥 Material Downloads
INSERT INTO user_analytics (user_id, event_type, event_data, timestamp) VALUES
(15, 'material_download', '{"material_title": "Hydrocarbons Quick Revision", "material_id": 3, "file_type": "pdf"}', '2025-06-05 12:00:00'),
(3, 'material_download', '{"material_title": "Backtracking Demo Video", "material_id": 8, "file_type": "video"}', '2025-06-06 10:45:00');

-- ❓ Doubt Asked
INSERT INTO user_analytics (user_id, event_type, event_data, timestamp) VALUES
(2, 'doubt_asked', '{"course_id": 5, "lesson_id": 1002, "question": "How does osmosis affect cell volume?"}', '2025-06-06 11:10:00'),
(5, 'doubt_asked', '{"course_id": 10, "lesson_id": 1014, "question": "What is Markovnikov rule?"}', '2025-06-07 10:30:00');

PRAGMA foreign_keys = ON;
