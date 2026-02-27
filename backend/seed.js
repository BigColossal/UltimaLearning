import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Skill from "./models/Skill.js";
import Domain from "./models/Domain.js";
import Subskill from "./models/Subskill.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ultimalearning",
    );
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Skill.deleteMany({});
    await Domain.deleteMany({});
    await Subskill.deleteMany({});

    // Create default user
    const user = await User.create({
      username: "Jeremy",
      email: "user@ultimalearning.com",
    });

    /*
    =========================
    MATEMÁTICA
    =========================
    */

    const matematica = await Skill.create({
      name: "Matemática",
      description: "Estudio de números, estructuras y razonamiento lógico",
      userId: user._id,
    });

    const algebra = await Domain.create({
      name: "Álgebra",
      description: "Manipulación de expresiones y ecuaciones",
      skillId: matematica._id,
    });

    await Subskill.insertMany([
      {
        name: "Ecuaciones lineales",
        description: "Resolver ecuaciones de primer grado",
        domainId: algebra._id,
        xp: 300,
      },
      {
        name: "Sistemas de ecuaciones",
        description: "Métodos de sustitución y eliminación",
        domainId: algebra._id,
        xp: 400,
      },
      {
        name: "Polinomios",
        description: "Operaciones y factorización",
        domainId: algebra._id,
        xp: 350,
      },
    ]);

    const geometria = await Domain.create({
      name: "Geometría",
      description: "Estudio de figuras y sus propiedades",
      skillId: matematica._id,
    });

    await Subskill.insertMany([
      {
        name: "Áreas y perímetros",
        description: "Cálculo en figuras planas",
        domainId: geometria._id,
        xp: 250,
      },
      {
        name: "Teorema de Pitágoras",
        description: "Relación entre lados de triángulos rectángulos",
        domainId: geometria._id,
        xp: 300,
      },
      {
        name: "Volumen de sólidos",
        description: "Cálculo en figuras tridimensionales",
        domainId: geometria._id,
        xp: 350,
      },
    ]);

    /*
    =========================
    HISTORIA
    =========================
    */

    const historia = await Skill.create({
      name: "Historia",
      description: "Estudio de los eventos y procesos del pasado",
      userId: user._id,
    });

    const historiaAntigua = await Domain.create({
      name: "Historia Antigua",
      description: "Civilizaciones antiguas y sus aportes",
      skillId: historia._id,
    });

    await Subskill.insertMany([
      {
        name: "Egipto Antiguo",
        description: "Faraones, pirámides y cultura",
        domainId: historiaAntigua._id,
        xp: 250,
      },
      {
        name: "Grecia Clásica",
        description: "Democracia y filosofía",
        domainId: historiaAntigua._id,
        xp: 300,
      },
      {
        name: "Imperio Romano",
        description: "Expansión y legado cultural",
        domainId: historiaAntigua._id,
        xp: 350,
      },
    ]);

    const historiaModerna = await Domain.create({
      name: "Historia Moderna",
      description: "Eventos desde el siglo XV en adelante",
      skillId: historia._id,
    });

    await Subskill.insertMany([
      {
        name: "Revolución Francesa",
        description: "Cambios políticos y sociales en Europa",
        domainId: historiaModerna._id,
        xp: 300,
      },
      {
        name: "Independencias de América",
        description: "Movimientos independentistas",
        domainId: historiaModerna._id,
        xp: 350,
      },
      {
        name: "Guerras Mundiales",
        description: "Conflictos globales del siglo XX",
        domainId: historiaModerna._id,
        xp: 400,
      },
    ]);

    /*
    =========================
    CIENCIA
    =========================
    */

    const ciencia = await Skill.create({
      name: "Ciencia",
      description: "Estudio del mundo natural mediante el método científico",
      userId: user._id,
    });

    const biologia = await Domain.create({
      name: "Biología",
      description: "Estudio de los seres vivos",
      skillId: ciencia._id,
    });

    await Subskill.insertMany([
      {
        name: "La célula",
        description: "Estructura y función celular",
        domainId: biologia._id,
        xp: 300,
      },
      {
        name: "Genética básica",
        description: "Herencia y ADN",
        domainId: biologia._id,
        xp: 350,
      },
      {
        name: "Ecosistemas",
        description: "Relaciones entre organismos y ambiente",
        domainId: biologia._id,
        xp: 250,
      },
    ]);

    const fisica = await Domain.create({
      name: "Física",
      description: "Leyes que rigen la materia y la energía",
      skillId: ciencia._id,
    });

    await Subskill.insertMany([
      {
        name: "Movimiento y fuerzas",
        description: "Conceptos de velocidad y aceleración",
        domainId: fisica._id,
        xp: 300,
      },
      {
        name: "Energía",
        description: "Tipos y transformaciones de energía",
        domainId: fisica._id,
        xp: 350,
      },
      {
        name: "Electricidad básica",
        description: "Corriente y circuitos simples",
        domainId: fisica._id,
        xp: 400,
      },
    ]);

    console.log("Seed data created successfully!");
    console.log(`Created ${await Skill.countDocuments()} skills`);
    console.log(`Created ${await Domain.countDocuments()} domains`);
    console.log(`Created ${await Subskill.countDocuments()} subskills`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
