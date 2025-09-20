
import { sql } from '../lib/database';
import bcrypt from 'bcrypt';

// Helper function to convert array to PostgreSQL array format
function toPgArray(arr: string[]): string {
  return `{${arr.map(item => `"${item.replace(/"/g, '\\"')}"`).join(',')}}`;
}

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (optional - remove if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await sql`DELETE FROM notifications`;
    await sql`DELETE FROM applications`;
    await sql`DELETE FROM candidates`;
    await sql`DELETE FROM jobs`;
    await sql`DELETE FROM users_sync`;

    // Seed Users
    console.log('👥 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        id: 'user-admin-1',
        email: 'admin@jobboard.com',
        name: 'Admin User',
        role: 'ADMIN',
        image: null,
        passwordHash: hashedPassword,
      },
      {
        id: 'user-employer-1',
        email: 'employer@techcorp.com',
        name: 'John Smith',
        role: 'EMPLOYER',
        image: null,
        passwordHash: hashedPassword,
      },
      {
        id: 'user-employer-2',
        email: 'hr@startup.io',
        name: 'Sarah Johnson',
        role: 'EMPLOYER',
        image: null,
        passwordHash: hashedPassword,
      },
      {
        id: 'user-candidate-1',
        email: 'alice.dev@gmail.com',
        name: 'Alice Developer',
        role: 'CANDIDATE',
        image: null,
        passwordHash: hashedPassword,
      },
      {
        id: 'user-candidate-2',
        email: 'bob.designer@gmail.com',
        name: 'Bob Designer',
        role: 'CANDIDATE',
        image: null,
        passwordHash: hashedPassword,
      },
      {
        id: 'user-candidate-3',
        email: 'charlie.manager@gmail.com',
        name: 'Charlie Manager',
        role: 'CANDIDATE',
        image: null,
        passwordHash: hashedPassword,
      },
    ];
    for (const user of users) {
      await sql`
        INSERT INTO users_sync (id, email, name, role, image, "passwordHash", "createdAt", "updatedAt")
        VALUES (${user.id}, ${user.email}, ${user.name}, ${user.role}, ${user.image}, ${user.passwordHash}, NOW(), NOW())
      `;
    }

    // Seed Jobs
    console.log('💼 Seeding jobs...');
    const jobs = [
      {
        title: 'Senior Full Stack Developer',
        company: 'TechCorp',
        location: 'Paris, France',
        type: 'CDI',
        salaryMin: 45000,
        salaryMax: 65000,
        currency: 'EUR',
        description: 'We are looking for a Senior Full Stack Developer to join our growing team. You will work on cutting-edge web applications using React, Node.js, and PostgreSQL.',
        requirements: '5+ years of experience in full stack development, React, Node.js, PostgreSQL',
        benefits: 'Health insurance, flexible hours, remote work options',
        remoteWork: true,
        experienceLevel: 'Senior',
        contractDuration: null,
        applicationUrl: null,
        applicationEmail: 'jobs@techcorp.com',
        companyLogo: 'https://via.placeholder.com/100x100?text=TC',
        companyWebsite: 'https://techcorp.com',
        tags: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
        featured: true,
        status: 'active',
        createdBy: 'user-employer-1',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      {
        title: 'UX/UI Designer',
        company: 'StartupIO',
        location: 'Lyon, France',
        type: 'CDD',
        salaryMin: 35000,
        salaryMax: 45000,
        currency: 'EUR',
        description: 'Join our design team to create beautiful and intuitive user experiences for our SaaS platform.',
        requirements: '3+ years of UX/UI design experience, proficiency in Figma, Adobe Creative Suite',
        benefits: 'Creative freedom, learning budget, team events',
        remoteWork: false,
        experienceLevel: 'Mid',
        contractDuration: '12 months',
        applicationUrl: 'https://startup.io/careers/ux-designer',
        applicationEmail: null,
        companyLogo: 'https://via.placeholder.com/100x100?text=SI',
        companyWebsite: 'https://startup.io',
        tags: ['UX', 'UI', 'Figma', 'Design'],
        featured: false,
        status: 'active',
        createdBy: 'user-employer-2',
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      },
      {
        title: 'DevOps Engineer',
        company: 'TechCorp',
        location: 'Remote',
        type: 'Freelance',
        salaryMin: 500,
        salaryMax: 800,
        currency: 'EUR',
        description: 'Looking for an experienced DevOps engineer to help scale our infrastructure and improve our CI/CD pipelines.',
        requirements: 'Strong experience with AWS, Docker, Kubernetes, Jenkins',
        benefits: 'Flexible schedule, competitive rates',
        remoteWork: true,
        experienceLevel: 'Senior',
        contractDuration: '6 months',
        applicationUrl: null,
        applicationEmail: 'freelance@techcorp.com',
        companyLogo: 'https://via.placeholder.com/100x100?text=TC',
        companyWebsite: 'https://techcorp.com',
        tags: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
        featured: true,
        status: 'active',
        createdBy: 'user-employer-1',
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      },
      {
        title: 'Junior Frontend Developer',
        company: 'StartupIO',
        location: 'Marseille, France',
        type: 'Stage',
        salaryMin: 800,
        salaryMax: 1200,
        currency: 'EUR',
        description: 'Great opportunity for a junior developer to learn and grow in a fast-paced startup environment.',
        requirements: 'Basic knowledge of HTML, CSS, JavaScript, enthusiasm for learning',
        benefits: 'Mentorship, potential for permanent position',
        remoteWork: false,
        experienceLevel: 'Junior',
        contractDuration: '6 months',
        applicationUrl: 'https://startup.io/careers/junior-frontend',
        applicationEmail: null,
        companyLogo: 'https://via.placeholder.com/100x100?text=SI',
        companyWebsite: 'https://startup.io',
        tags: ['HTML', 'CSS', 'JavaScript', 'React'],
        featured: false,
        status: 'active',
        createdBy: 'user-employer-2',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      },
      {
        title: 'Product Manager',
        company: 'TechCorp',
        location: 'Paris, France',
        type: 'CDI',
        salaryMin: 55000,
        salaryMax: 75000,
        currency: 'EUR',
        description: 'Lead product strategy and development for our flagship SaaS platform.',
        requirements: '5+ years of product management experience, technical background preferred',
        benefits: 'Stock options, comprehensive benefits package',
        remoteWork: true,
        experienceLevel: 'Senior',
        contractDuration: null,
        applicationUrl: null,
        applicationEmail: 'pm@techcorp.com',
        companyLogo: 'https://via.placeholder.com/100x100?text=TC',
        companyWebsite: 'https://techcorp.com',
        tags: ['Product Management', 'SaaS', 'Strategy'],
        featured: true,
        status: 'active',
        createdBy: 'user-employer-1',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    ];

    for (const job of jobs) {
      console.log(`Inserting job: ${job.title} with tags: ${toPgArray(job.tags)}`);
      await sql`
        INSERT INTO jobs (
          title, company, location, type, "salaryMin", "salaryMax", currency,
          description, requirements, benefits, "remoteWork", "experienceLevel",
          "contractDuration", "applicationUrl", "applicationEmail", "companyLogo",
          "companyWebsite", tags, featured, status, "createdBy", "expiresAt", "createdAt", "updatedAt"
        ) VALUES (
          ${job.title}, ${job.company}, ${job.location}, ${job.type}, ${job.salaryMin},
          ${job.salaryMax}, ${job.currency}, ${job.description}, ${job.requirements},
          ${job.benefits}, ${job.remoteWork}, ${job.experienceLevel}, ${job.contractDuration},
          ${job.applicationUrl}, ${job.applicationEmail}, ${job.companyLogo}, ${job.companyWebsite},
          ${toPgArray(job.tags)}, ${job.featured}, ${job.status}, ${job.createdBy}, ${job.expiresAt.toISOString()}, NOW(), NOW()
        )
      `;
    }
    console.log('✅ Jobs seeded successfully');

    // Get the actual job IDs
    const jobResults = await sql`SELECT id, title FROM jobs ORDER BY id`;
    console.log('Job IDs:', jobResults);

    // Seed Candidates
    console.log('👤 Seeding candidates...');
    const candidates = [
      {
        userId: 'user-candidate-1',
        firstName: 'Alice',
        lastName: 'Developer',
        phone: '+33 6 12 34 56 78',
        location: 'Paris, France',
        bio: 'Passionate full-stack developer with 4 years of experience in React and Node.js.',
        resumeUrl: 'https://example.com/resume-alice.pdf',
        linkedinUrl: 'https://linkedin.com/in/alice-developer',
        portfolioUrl: 'https://alice.dev',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        experienceLevel: 'Mid',
        availability: 'Immediately available',
      },
      {
        userId: 'user-candidate-2',
        firstName: 'Bob',
        lastName: 'Designer',
        phone: '+33 6 98 76 54 32',
        location: 'Lyon, France',
        bio: 'Creative UX/UI designer with a passion for user-centered design and modern design tools.',
        resumeUrl: 'https://example.com/resume-bob.pdf',
        linkedinUrl: 'https://linkedin.com/in/bob-designer',
        portfolioUrl: 'https://bob.design',
        skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
        experienceLevel: 'Mid',
        availability: '2 weeks notice',
      },
      {
        userId: 'user-candidate-3',
        firstName: 'Charlie',
        lastName: 'Manager',
        phone: '+33 6 55 44 33 22',
        location: 'Marseille, France',
        bio: 'Experienced product manager with a background in software development.',
        resumeUrl: 'https://example.com/resume-charlie.pdf',
        linkedinUrl: 'https://linkedin.com/in/charlie-manager',
        portfolioUrl: 'https://charlie.pm',
        skills: ['Product Management', 'Agile', 'Analytics', 'Leadership'],
        experienceLevel: 'Senior',
        availability: '1 month notice',
      },
    ];

    for (const candidate of candidates) {
      await sql`
        INSERT INTO candidates (
          "userId", "firstName", "lastName", phone, location, bio,
          "resumeUrl", "linkedinUrl", "portfolioUrl", skills,
          "experienceLevel", availability, "createdAt", "updatedAt"
        ) VALUES (
          ${candidate.userId}, ${candidate.firstName}, ${candidate.lastName},
          ${candidate.phone}, ${candidate.location}, ${candidate.bio},
          ${candidate.resumeUrl}, ${candidate.linkedinUrl}, ${candidate.portfolioUrl},
          ${toPgArray(candidate.skills)}, ${candidate.experienceLevel}, ${candidate.availability}, NOW(), NOW()
        )
      `;
    }

    // Seed Applications
    console.log('📝 Seeding applications...');
    const applications = [
      {
        jobTitle: 'Senior Full Stack Developer',
        candidateEmail: 'alice.dev@gmail.com',
        coverLetter: 'I am excited to apply for the Senior Full Stack Developer position. With my 4 years of experience in React and Node.js, I believe I would be a great fit for your team.',
        status: 'pending',
      },
      {
        jobTitle: 'UX/UI Designer',
        candidateEmail: 'bob.designer@gmail.com',
        coverLetter: 'I would love to bring my design expertise to StartupIO. My experience with Figma and user-centered design aligns perfectly with your needs.',
        status: 'reviewed',
      },
      {
        jobTitle: 'Senior Full Stack Developer',
        candidateEmail: 'charlie.manager@gmail.com',
        coverLetter: 'Although my background is in product management, I have strong technical skills and would love to contribute to your development team.',
        status: 'accepted',
      },
      {
        jobTitle: 'Product Manager',
        candidateEmail: 'charlie.manager@gmail.com',
        coverLetter: 'I am very interested in the Product Manager position at TechCorp. My experience in product management and technical background make me an ideal candidate.',
        status: 'pending',
      },
    ];

    // Map job titles and candidate names to IDs
    const jobMap = new Map();
    const candidateMap = new Map();

    const jobRows = await sql`SELECT id, title FROM jobs`;
    for (const row of jobRows) {
      jobMap.set(row.title, row.id);
    }

    const candidateRows = await sql`SELECT id, "userId" FROM candidates`;
    for (const row of candidateRows) {
      const user = await sql`SELECT email FROM users_sync WHERE id = ${row.userId}`;
      if (user.length > 0) {
        candidateMap.set(user[0].email, row.id);
      }
    }

    for (const application of applications) {
      const jobId = jobMap.get(application.jobTitle);
      const candidateId = candidateMap.get(application.candidateEmail);
      if (!jobId || !candidateId) {
        console.warn(`Skipping application for job ${application.jobTitle} and candidate ${application.candidateEmail} due to missing IDs`);
        continue;
      }
      await sql`
        INSERT INTO applications ( "jobId", "candidateId", "coverLetter", status, "appliedAt", "updatedAt" )
        VALUES ( ${jobId}, ${candidateId}, ${application.coverLetter}, ${application.status}, NOW(), NOW() )
      `;
    }

    // Seed Notifications
    console.log('🔔 Seeding notifications...');
    const notifications = [
      {
        userId: 'user-candidate-1',
        type: 'application_status',
        title: 'Application Update',
        message: 'Your application for Senior Full Stack Developer at TechCorp has been received.',
        read: false,
      },
      {
        userId: 'user-candidate-2',
        type: 'application_status',
        title: 'Application Reviewed',
        message: 'Your application for UX/UI Designer at StartupIO is being reviewed.',
        read: true,
      },
      {
        userId: 'user-candidate-3',
        type: 'application_status',
        title: 'Application Accepted',
        message: 'Congratulations! Your application for Senior Full Stack Developer at TechCorp has been accepted.',
        read: false,
      },
      {
        userId: 'user-employer-1',
        type: 'job_match',
        title: 'New Application',
        message: 'You have received a new application for Senior Full Stack Developer.',
        read: false,
      },
      {
        userId: 'user-employer-2',
        type: 'job_match',
        title: 'New Application',
        message: 'You have received a new application for UX/UI Designer.',
        read: true,
      },
    ];

    for (const notification of notifications) {
      await sql`
        INSERT INTO notifications ( "userId", type, title, message, read )
        VALUES ( ${notification.userId}, ${notification.type}, ${notification.title}, ${notification.message}, ${notification.read} )
      `;
    }

    console.log('✅ Database seed completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${jobs.length} jobs created`);
    console.log(`   - ${candidates.length} candidates created`);
    console.log(`   - ${applications.length} applications created`);
    console.log(`   - ${notifications.length} notifications created`);

  } catch (error) {
    console.error('❌ Error during database seed:', error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('🎉 Seed script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed script failed:', error);
    process.exit(1);
  });
