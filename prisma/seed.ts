import { PrismaClient, AuthProvider, ConnectionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting TechiesSocial database seed...');

  // Clean existing data
  await prisma.comment.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.connection.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Create Techies Profiles
  const sarah = await prisma.user.create({
    data: {
      email: 'sarah.dev@techies.io',
      name: 'Sarah Chen',
      passwordHash: defaultPassword,
      headline: 'Staff Infrastructure & Distributed Systems Engineer',
      bio: 'Building resilient cloud backends, high-throughput microservices, and Kubernetes clusters. Open source advocate and tech writer.',
      location: 'San Francisco, CA',
      skills: ['TypeScript', 'Go', 'Kubernetes', 'PostgreSQL', 'Distributed Systems', 'Kafka'],
      authProvider: AuthProvider.EMAIL,
    },
  });

  const alex = await prisma.user.create({
    data: {
      email: 'alex.design@techies.io',
      name: 'Alex Rivera',
      passwordHash: defaultPassword,
      headline: 'Lead Product Designer & Design Systems Architect',
      bio: 'Bridging the gap between engineering and UX with robust design tokens, accessibility standards, and micro-interactions.',
      location: 'New York, NY',
      skills: ['Figma', 'Design Systems', 'UI/UX', 'CSS Architecture', 'Accessibility', 'React Native'],
      authProvider: AuthProvider.EMAIL,
    },
  });

  const david = await prisma.user.create({
    data: {
      email: 'david.ai@techies.io',
      name: 'David Kim',
      passwordHash: defaultPassword,
      headline: 'Machine Learning Engineer & LLM Researcher',
      bio: 'Focusing on efficient inference, edge ML deployment, and agentic workflows in production.',
      location: 'Seattle, WA',
      skills: ['Python', 'PyTorch', 'FastAPI', 'LLMs', 'Vector Databases', 'Docker'],
      authProvider: AuthProvider.EMAIL,
    },
  });

  const elena = await prisma.user.create({
    data: {
      email: 'elena.mobile@techies.io',
      name: 'Elena Rostova',
      passwordHash: defaultPassword,
      headline: 'Principal Mobile Architect (React Native / iOS)',
      bio: 'Passionate about mobile performance, 60fps animations, offline-first architectures, and cross-platform native modules.',
      location: 'Austin, TX',
      skills: ['React Native', 'TypeScript', 'Expo', 'Swift', 'GraphQL', 'Mobile Architecture'],
      authProvider: AuthProvider.EMAIL,
    },
  });

  const marcus = await prisma.user.create({
    data: {
      email: 'marcus.sec@techies.io',
      name: 'Marcus Vance',
      passwordHash: defaultPassword,
      headline: 'Cybersecurity & Application Security Specialist',
      bio: 'Zero trust security, DevSecOps pipelines, cryptography, and penetration testing.',
      location: 'London, UK',
      skills: ['Security', 'OAuth2', 'Cryptography', 'Go', 'Linux', 'AWS'],
      authProvider: AuthProvider.EMAIL,
    },
  });

  console.log(`✅ Created 5 techie profiles: Sarah, Alex, David, Elena, Marcus`);

  // 2. Create Connections
  // Sarah & Alex (ACCEPTED)
  await prisma.connection.create({
    data: {
      requesterId: sarah.id,
      receiverId: alex.id,
      status: ConnectionStatus.ACCEPTED,
    },
  });

  // Sarah & Elena (ACCEPTED)
  await prisma.connection.create({
    data: {
      requesterId: elena.id,
      receiverId: sarah.id,
      status: ConnectionStatus.ACCEPTED,
    },
  });

  // David -> Sarah (PENDING invitation to Sarah)
  await prisma.connection.create({
    data: {
      requesterId: david.id,
      receiverId: sarah.id,
      status: ConnectionStatus.PENDING,
    },
  });

  // Sarah -> Marcus (PENDING invitation sent by Sarah)
  await prisma.connection.create({
    data: {
      requesterId: sarah.id,
      receiverId: marcus.id,
      status: ConnectionStatus.PENDING,
    },
  });

  console.log(`✅ Created relational connections & pending invitations`);

  // 3. Create Tech Posts
  const post1 = await prisma.post.create({
    data: {
      authorId: sarah.id,
      content:
        '🚀 Just published our engineering deep-dive on scaling PostgreSQL to 50k QPS without sacrificing ACID guarantees.\n\nKey takeaways:\n1. Intelligent read replica pooling with PgBouncer\n2. Partitioning event logs by month\n3. Zero-downtime schema migrations using safe column additions\n\nWhat are your go-to database scaling patterns?',
    },
  });

  const post2 = await prisma.post.create({
    data: {
      authorId: alex.id,
      content:
        '🎨 Design systems tip: If your typography scale is not mapped directly to rem/token units with strict contrast ratios (WCAG AAA), you will accumulate visual debt rapidly.\n\nWe standardized our color palette to semantic tokens (`colors.surface`, `colors.primaryMuted`) and cut frontend UI review cycles by 40%!',
    },
  });

  const post3 = await prisma.post.create({
    data: {
      authorId: elena.id,
      content:
        '📱 The new React Native architecture (Fabric + TurboModules) with Expo Router makes cross-platform mobile apps feel as buttery smooth as pure native Swift. If you have not tested Hermes memory profiling recently, give it a spin!',
    },
  });

  const post4 = await prisma.post.create({
    data: {
      authorId: david.id,
      content:
        '🤖 Benchmarking local embedding models on Apple Silicon. Running quantized quantized models locally with sub-10ms latency is now a reality for edge applications. Exciting times for on-device AI!',
    },
  });

  // 4. Create Likes
  await prisma.like.create({
    data: { postId: post1.id, userId: alex.id },
  });
  await prisma.like.create({
    data: { postId: post1.id, userId: elena.id },
  });
  await prisma.like.create({
    data: { postId: post2.id, userId: sarah.id },
  });
  await prisma.like.create({
    data: { postId: post3.id, userId: sarah.id },
  });
  await prisma.like.create({
    data: { postId: post3.id, userId: alex.id },
  });

  // 5. Create Comments
  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: alex.id,
      content:
        'Awesome writeup Sarah! Did you consider connection pooling overhead when autoscaling pods?',
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: sarah.id,
      content:
        '@Alex Great question! We capped each pod connection pool to 5 and let PgBouncer handle multiplexing.',
    },
  });

  await prisma.comment.create({
    data: {
      postId: post3.id,
      authorId: sarah.id,
      content:
        'Totally agree Elena! Expo Router has eliminated so much navigation boilerplate.',
    },
  });

  console.log(`✅ Created posts, likes, and nested comment threads`);
  console.log(`🎉 Database seeding completed successfully!`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
