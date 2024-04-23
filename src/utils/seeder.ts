import { Strapi } from '@strapi/strapi';
import { faker } from '@faker-js/faker';
import { ProductBrand_Plain } from '../../types/schemas-to-ts/api/product-brand';
import { Product_Plain } from '../../types/schemas-to-ts/api/product';
import { ProductSpecification_Plain } from '../../types/schemas-to-ts/components/product/ProductSpecification';
import { EcoData_Plain } from '../../types/schemas-to-ts/components/product/EcoData';
import fs from 'node:fs';
import mime from 'mime-types';

const categories = fs.readdirSync('./public/dummy-images');
const imageMap = {};

for (const category of categories) {
  const images = fs.readdirSync(`./public/dummy-images/${category}`);
  for (const image of images) {
    imageMap[category] = imageMap[category] || [];
    imageMap[category].push(`dummy-images/${category}/${image}`);
  }
}

async function seedProductCategories(strapi: Strapi) {
  const itemsCount = await strapi
    .query('api::product-category.product-category')
    .count();

  if (itemsCount > 0) {
    // delete all existing product categories
    await strapi.query('api::product-category.product-category').deleteMany({});
  }

  const productCategories = [
    {
      name: 'TVs',
      slug: 'tvs',
    },
    {
      name: 'Washing Machines',
      slug: 'washing-machines',
    },
    {
      name: 'Lighting',
      slug: 'lighting',
    },
    {
      name: 'Audio',
      slug: 'audio',
    },
  ];

  await strapi.query('api::product-category.product-category').createMany({
    data: productCategories.map((productCategory) => {
      return {
        name: productCategory.name,
        slug: productCategory.slug,
        publishedAt: new Date(),
      };
    }),
  });
}

async function seedProductBrands(strapi: Strapi) {
  const itemsCount = await strapi
    .query('api::product-brand.product-brand')
    .count();

  if (itemsCount > 0) {
    // delete all existing product brands
    await strapi.query('api::product-brand.product-brand').deleteMany({});
  }

  const productBrands: Array<
    Partial<ProductBrand_Plain> & {
    eco_friendly: boolean;
  }
  > = [
    {
      name: 'TerraVolt',
      description:
        'A leading manufacturer of high-performance electronics known for cutting-edge technology and powerful features. (Non-Eco-friendly)',
      eco_friendly: false,
    },
    {
      name: 'EverLife',
      description:
        'A company dedicated to creating sustainable and long-lasting electronics with a focus on recycled materials and energy efficiency. (Eco-friendly)',
      eco_friendly: true,
    },
    {
      name: 'EcoSound',
      description:
        'A brand committed to producing eco-friendly audio equipment with a focus on sound quality and durability. (Eco-friendly)',
      eco_friendly: true,
    },
    {
      name: 'SonicStar',
      description:
        'A brand known for its sleek designs and impressive audio quality, offering a wide range of headphones and speakers. (Non-Eco-friendly)',
      eco_friendly: false,
    },
    {
      name: 'ClearStream Tech',
      description:
        'A company committed to developing water-saving and eco-conscious appliances for the modern home. (Eco-friendly)',
      eco_friendly: true,
    },
    {
      name: 'Greenwave',
      description:
        'A brand specializing in solar-powered electronics and energy-efficient devices for a greener lifestyle. (Eco-friendly)',
      eco_friendly: true,
    },
    {
      name: 'DigiForce',
      description:
        'A leader in high-resolution displays and powerful graphics cards, known for their immersive gaming experience. (Non-Eco-friendly)',
      eco_friendly: false,
    },
    {
      name: 'RenewLife',
      description:
        'A company focused on creating durable and repairable electronics, extending product lifespan and reducing waste. (Eco-friendly)',
      eco_friendly: true,
    },
    {
      name: 'Amplify Labs',
      description:
        'A brand known for its innovative sound technology and focus on delivering the loudest and most powerful audio systems. (Non-Eco-friendly)',
      eco_friendly: false,
    },
    {
      name: 'Lumiere Solutions',
      description:
        'A company dedicated to developing energy-efficient lighting solutions and smart home technology. (Eco-friendly)',
      eco_friendly: true,
    },
  ];

  await strapi.query('api::product-brand.product-brand').createMany({
    data: productBrands.map((productBrand): Partial<ProductBrand_Plain> => {
      return {
        name: productBrand.name,
        description: productBrand.description,
        publishedAt: new Date(),
      };
    }),
  });
}

function makeTvSpecifications(energy_efficient: boolean = true): ProductSpecification_Plain[] {
  return [
    {
      name: 'screen_size',
      value: faker.number.int({ min: 24, max: 85 }),
    },
    {
      name: 'resolution',
      value: faker.helpers.arrayElement(['HD', 'FHD', 'QHD', 'UHD']),
    },
    {
      name: 'refresh_rate',
      value: faker.helpers.arrayElement([60, 120, 144, 240]),
    },
    {
      name: 'smart_tv',
      value: faker.helpers.arrayElement([true, false]),
    },
    {
      name: 'energy_rating',
      value: faker.helpers.arrayElement(
        energy_efficient ? [
          'A+++',
          'A++',
          'A+',
          'A',
          'B',
          'C',
          'D',
        ] : ['B', 'C', 'D']),
    },
    {
      name: 'energy_star_certified',
      value: energy_efficient,
    },
  ];
}

async function seedEcoFriendlyTVs(strapi: Strapi) {
  const brands = ['EverLife', 'RenewLife'];
  const tvModels = ['EcoVision', 'GreenScreen', 'EcoStream', 'EcoView'];
  const descriptions = [
    'Enjoy the latest in high-definition entertainment with this cutting-edge TV.',
    'Experience stunning visuals and crystal-clear sound with this top-of-the-line TV.',
    'Upgrade your home entertainment system with this sleek and stylish TV.',
    'Immerse yourself in your favorite movies and shows with this state-of-the-art TV.',
  ];

  const products: Array<
    Omit<Product_Plain, 'brand' | 'id'> & {
    brand: number;
  }
  > = [];

  for (const brandName of brands) {
    for (const model of tvModels) {
      const brand: ProductBrand_Plain = await strapi
        .query('api::product-brand.product-brand')
        .findOne({
          where: {
            name: brandName,
          },
        });
      const category = await strapi
        .query('api::product-category.product-category')
        .findOne({
          where: {
            slug: 'tvs',
          },
        });

      const date = new Date();

      const ecoData: EcoData_Plain[] = [
        {
          name: 'recycled_materials',
          value: faker.helpers.arrayElements(
            ['plastic', 'metal', 'glass'],
            faker.number.int({ min: 0, max: 3 }),
          ),
        },
        {
          name: 'recycled_packaging',
          value: faker.helpers.arrayElement([true, false, true, false, true]),
        },
        {
          name: 'energy_efficient',
          value: faker.helpers.arrayElement([true, false, true, false, true]),
        },
        {
          name: 'repairable',
          value: faker.helpers.arrayElement([true, false, true, false, true]),
        },
        {
          name: 'carbon_footprint',
          // in kg of CO2
          value: faker.number.float({ min: 0.1, max: 5, multipleOf: 0.1 }),
        },
      ];

      products.push({
        name: `${brand.name} ${model}`,
        description: faker.helpers.arrayElement(descriptions),
        specifications: makeTvSpecifications(),
        eco_data: ecoData,
        brand: brand.id,
        price: parseFloat(faker.commerce.price({ min: 100 })),
        createdAt: date,
        updatedAt: date,
        publishedAt: date,
        category: category.id,
        cover_image: faker.helpers.arrayElement(imageMap['tvs'])
      });
    }
  }

  for (const product of products) {
    await strapi.entityService.create('api::product.product', {
      data: product,
    });
  }
}

async function seedNonEcoFriendlyTVs(strapi: Strapi) {
  const brands = ['TerraVolt', 'DigiForce'];
  const tvModels = ['UltraVision', 'SonicView', 'StarStream', 'TerraView'];

  for (const brandName of brands) {
    for (const model of tvModels) {
      const brand: ProductBrand_Plain = await strapi
        .query('api::product-brand.product-brand')
        .findOne({
          where: {
            name: brandName,
          },
        });
      const category = await strapi
        .query('api::product-category.product-category')
        .findOne({
          where: {
            slug: 'tvs',
          },
        });
      const date = new Date();

      const productData: Omit<Product_Plain, 'brand' | 'id'> & {
        brand: number;
      } = {
        name: `${brand.name} ${model}`,
        description: faker.commerce.productDescription(),
        specifications: makeTvSpecifications(false),
        eco_data: [
          {
            name: 'recycled_materials',
            value: [],
          },
          {
            name: 'recycled_packaging',
            value: false,
          },
          {
            name: 'energy_efficient',
            value: false,
          },
          {
            name: 'repairable',
            value: false,
          },
          {
            name: 'carbon_footprint',
            value: faker.number.float({ min: 5, max: 10, multipleOf: 0.1 }),
          },
        ],
        brand: brand.id,
        price: parseFloat(faker.commerce.price({ min: 100 })),
        createdAt: date,
        updatedAt: date,
        publishedAt: date,
        category: category.id,
        cover_image: faker.helpers.arrayElement(imageMap['tvs'])
      };

      await strapi.entityService.create('api::product.product', {
        data: productData,
      });
    }
  }
}

async function seedWashingMachines(strapi: Strapi) {
  const brands = ['EverLife', 'RenewLife', 'ClearStream Tech'];
  const models = ['EcoWash', 'GreenClean', 'EcoCycle', 'EcoDry'];

  for (const brandName of brands) {
    for (const model of models) {
      const brand: ProductBrand_Plain = await strapi
        .query('api::product-brand.product-brand')
        .findOne({
          where: {
            name: brandName,
          },
        });
      const category = await strapi
        .query('api::product-category.product-category')
        .findOne({
          where: {
            slug: 'washing-machines',
          },
        });
      const date = new Date();

      const ecoData: EcoData_Plain[] = [
        {
          name: 'recycled_materials',
          value: faker.helpers.arrayElements(
            ['plastic', 'metal', 'glass'],
            faker.number.int({ min: 0, max: 3 }),
          ),
        },
        {
          name: 'recycled_packaging',
          value: faker.helpers.arrayElement([true, false, true, true, false]),
        },
        {
          name: 'energy_efficient',
          value: faker.helpers.arrayElement([true, false, true, true, false]),
        },
        {
          name: 'repairable',
          value: faker.helpers.arrayElement([true, false, true, true, false]),
        },
        {
          name: 'water_saving',
          // in liters per cycle
          value: faker.number.float({ min: 0.1, max: 50, multipleOf: 0.1 }),
        },
        {
          name: 'carbon_footprint',
          // in kg of CO2
          value: faker.number.float({ min: 0.1, max: 5, multipleOf: 0.1 }),
        },
      ];

      const productData: Omit<Product_Plain, 'brand' | 'id'> & {
        brand: number;
      } = {
        name: `${brand.name} ${model}`,
        description: faker.helpers.arrayElement([
          'Keep your clothes fresh and clean with this high-performance washing machine.',
          'Experience the latest in laundry technology with this top-of-the-line washer.',
          'Upgrade your laundry room with this sleek and stylish washing machine.',
          'Get your clothes cleaner than ever before with this state-of-the-art washer.',
        ]),
        specifications: [
          {
            name: 'load_capacity',
            value: faker.helpers.arrayElement([5, 7, 9, 12]),
          },
          {
            name: 'energy_rating',
            value: faker.helpers.arrayElement([
              'A+++',
              'A++',
              'A+',
              'A',
            ]),
          },
          {
            name: 'energy_star_certified',
            value: faker.helpers.arrayElement([true, false, true, false, true]),
          },
          {
            name: 'wash_cycles',
            value: faker.helpers.arrayElement([10, 15, 20, 25]),
          },
          {
            name: 'spin_speed',
            value: faker.helpers.arrayElement([800, 1200, 1600, 2000]),
          },
        ],
        eco_data: ecoData,
        brand: brand.id,
        price: parseFloat(faker.commerce.price({ min: 300 })),
        createdAt: date,
        updatedAt: date,
        publishedAt: date,
        category: category.id,
        cover_image: faker.helpers.arrayElement(imageMap['washing-machines'])
      };

      await strapi.entityService.create('api::product.product', {
        data: productData,
      });
    }
  }
}

async function seedRandomLightingProducts(strapi: Strapi) {
  const brands = ['Greenwave', 'Lumiere Solutions'];
  const models = ['EcoLight', 'EcoBeam', 'EcoBulb', 'Luminate', 'SuperBright'];
  const category = await strapi
    .query('api::product-category.product-category')
    .findOne({
      where: {
        slug: 'lighting',
      },
    });

  for (const brandName of brands) {
    for (const model of models) {
      // skip invalid pattern like Lumiere Solutions with Eco
      if (brandName === 'Lumiere Solutions' && ['EcoLight', 'EcoBeam', 'EcoBulb'].includes(model)) {
        continue;
      }
      if (brandName === 'Greenwave' && ['Luminate', 'SuperBright'].includes(model)) {
        continue;
      }

      const brand: ProductBrand_Plain = await strapi
        .query('api::product-brand.product-brand')
        .findOne({
          where: {
            name: brandName,
          },
        });
      const date = new Date();

      const ecoData: EcoData_Plain[] =
        brandName === 'Lumiere Solutions' ? [
            {
              name: 'recycled_materials',
              value: [],
            },
            {
              name: 'recycled_packaging',
              value: false,
            },
            {
              name: 'energy_efficient',
              value: false,
            },
            {
              name: 'lifespan',
              // in hours
              value: faker.number.float({ min: 1000, max: 10000, multipleOf: 100 }),
            },
            {
              name: 'carbon_footprint',
              // in kg of CO2
              value: faker.number.float({ min: 5, max: 8, multipleOf: 0.1 }),
            },
          ] :
          [
            {
              name: 'recycled_materials',
              value: faker.helpers.arrayElements(
                ['plastic', 'metal', 'glass'],
                faker.number.int({ min: 0, max: 3 }),
              ),
            },
            {
              name: 'recycled_packaging',
              value: faker.helpers.arrayElement([true, false]),
            },
            {
              name: 'energy_efficient',
              value: faker.helpers.arrayElement([true, false]),
            },
            {
              name: 'lifespan',
              // in hours
              value: faker.number.float({ min: 1000, max: 10000, multipleOf: 100 }),
            },
            {
              name: 'carbon_footprint',
              // in kg of CO2
              value: faker.number.float({ min: 0.1, max: 5, multipleOf: 0.1 }),
            },
          ];

      const productData: Omit<Product_Plain, 'brand' | 'id'> & {
        brand: number;
      } = {
        name: `${brand.name} ${model}`,
        description: faker.helpers.arrayElement([
          'Illuminate your home with this energy-efficient and long-lasting light bulb.',
          'Create the perfect ambiance with this stylish and eco-friendly lighting solution.',
          'Upgrade your lighting system with this modern and sustainable light fixture.',
          'Brighten up any room with this high-quality and environmentally friendly light source.',
        ]),
        specifications: [
          {
            name: 'light_output',
            value: faker.helpers.arrayElement([800, 1000, 1200, 1500]),
          },
          {
            name: 'color_temperature',
            value: faker.helpers.arrayElement([
              '2700K',
              '3000K',
              '4000K',
              '5000K',
            ]),
          },
          {
            name: 'lumens_per_watt',
            value: faker.helpers.arrayElement([80, 100, 120, 150]),
          },
          {
            name: 'dimmer_compatible',
            value: faker.helpers.arrayElement([true, false]),
          },
        ],
        eco_data: ecoData,
        brand: brand.id,
        price: parseFloat(faker.commerce.price({ min: 10 })),
        createdAt: date,
        updatedAt: date,
        publishedAt: date,
        category: category.id,
        cover_image: faker.helpers.arrayElement(imageMap['lighting'])
      };

      await strapi.entityService.create('api::product.product', {
        data: productData,
      });
    }
  }
}

async function seedRandomAudioProducts(strapi: Strapi) {
  const brands = ['SonicStar', 'Amplify Labs', 'EcoSound'];
  const models = ['SonicBlast', 'StarSound', 'SonicWave', 'AmplifyPro'];
  const category = await strapi
    .query('api::product-category.product-category')
    .findOne({
      where: {
        slug: 'audio',
      },
    });

  for (const brandName of brands) {
    for (const model of models) {
      // skip invalid pattern like EcoSound with Non-Eco products
      if (brandName === 'EcoSound' && ['AmplifyPro', 'SonicBlast']) continue;

      const brand: ProductBrand_Plain = await strapi
        .query('api::product-brand.product-brand')
        .findOne({
          where: {
            name: brandName,
          },
        });
      const date = new Date();

      const ecoData: EcoData_Plain[] =
        brandName !== 'EcoSound' ? [
            {
              name: 'recycled_materials',
              value: [],
            },
            {
              name: 'recycled_packaging',
              value: false,
            },
            {
              name: 'energy_efficient',
              value: false,
            },
            {
              name: 'repairable',
              value: false,
            },
            {
              name: 'carbon_footprint',
              // in kg of CO2
              value: faker.number.float({ min: 5, max: 8, multipleOf: 0.1 }),
            },
          ] :
          [
            {
              name: 'recycled_materials',
              value: faker.helpers.arrayElements(
                ['plastic', 'metal', 'glass'],
                faker.number.int({ min: 0, max: 3 }),
              ),
            },
            {
              name: 'recycled_packaging',
              value: faker.helpers.arrayElement([true, false, true, false, true]),
            },
            {
              name: 'energy_efficient',
              value: faker.helpers.arrayElement([true, false, true, false, true]),
            },
            {
              name: 'repairable',
              value: faker.helpers.arrayElement([true, false, true, false, true]),
            },
            {
              name: 'carbon_footprint',
              // in kg of CO2
              value: faker.number.float({ min: 0.1, max: 5, multipleOf: 0.1 }),
            },
          ];

      const productData: Omit<Product_Plain, 'brand' | 'id'> & {
        brand: number;
      } = {
        name: `${brand.name} ${model}`,
        description: faker.helpers.arrayElement([
          'Immerse yourself in your favorite music with this powerful and dynamic speaker system.',
          'Experience crystal-clear sound and deep bass with this premium audio device.',
          'Upgrade your home entertainment system with this high-quality and eco-friendly speaker.',
          'Get the party started with this loud and durable sound system.',
        ]),
        specifications: [
          {
            name: 'power_output',
            value: faker.helpers.arrayElement([20, 40, 60, 80]),
          },
          {
            name: 'frequency_response',
            value: faker.helpers.arrayElement(['20Hz-20kHz', '30Hz-20kHz']),
          },
          {
            name: 'bluetooth_compatible',
            value: faker.helpers.arrayElement([true, false]),
          },
          {
            name: 'voice_control',
            value: faker.helpers.arrayElement([true, false]),
          },
          {
            name: 'water_resistant',
            value: faker.helpers.arrayElement([true, false]),
          },
          {
            name: 'sound_quality',
            value: faker.helpers.arrayElement(['high', 'medium', 'low']),
          },
        ],
        eco_data: ['EcoSound'].includes(brand.name) ? ecoData : [],
        brand: brand.id,
        price: parseFloat(faker.commerce.price({ min: 50 })),
        createdAt: date,
        updatedAt: date,
        publishedAt: date,
        category: category.id,
        cover_image: faker.helpers.arrayElement(imageMap['audio'])
      };

      await strapi.entityService.create('api::product.product', {
        data: productData,
      });
    }
  }
}

async function seedRandomProductData(strapi: Strapi) {
  const productCount = await strapi.query('api::product.product').count();
  if (productCount > 0) {
    // delete all existing products
    await strapi.query('api::product.product').deleteMany({});
  }

  await seedEcoFriendlyTVs(strapi);
  await seedNonEcoFriendlyTVs(strapi);
  await seedWashingMachines(strapi);
  await seedRandomLightingProducts(strapi);
  await seedRandomAudioProducts(strapi);
}

export default async function seedData(strapi: Strapi) {
  faker.seed(123456);
  await seedProductCategories(strapi);
  await seedProductBrands(strapi);
  await seedRandomProductData(strapi);
  strapi.log.info('Product data seeded successfully');
}
