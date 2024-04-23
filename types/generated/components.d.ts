import type { Schema, Attribute } from '@strapi/strapi';

export interface ProductEcoData extends Schema.Component {
  collectionName: 'components_product_eco_data';
  info: {
    displayName: 'EcoData';
    icon: 'rocket';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    value: Attribute.JSON & Attribute.Required;
  };
}

export interface ProductProductSpecification extends Schema.Component {
  collectionName: 'components_product_product_specifications';
  info: {
    displayName: 'ProductSpecification';
    icon: 'information';
    description: '';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    value: Attribute.JSON & Attribute.Required;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'product.eco-data': ProductEcoData;
      'product.product-specification': ProductProductSpecification;
    }
  }
}
