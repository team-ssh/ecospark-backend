// Interface automatically generated by schemas-to-ts

import { ProductSpecification } from '../components/product/ProductSpecification';
import { EcoData } from '../components/product/EcoData';
import { ProductBrand } from './product-brand';
import { ProductCategory } from './product-category';
import { ProductSpecification_Plain } from '../components/product/ProductSpecification';
import { EcoData_Plain } from '../components/product/EcoData';
import { ProductBrand_Plain } from './product-brand';
import { ProductCategory_Plain } from './product-category';
import { ProductSpecification_NoRelations } from '../components/product/ProductSpecification';
import { EcoData_NoRelations } from '../components/product/EcoData';
import { AdminPanelRelationPropertyModification } from '../common/AdminPanelRelationPropertyModification';

export interface Product {
  id: number;
  attributes: {
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    name: string;
    description?: string;
    specifications: ProductSpecification[];
    eco_data: EcoData[];
    price: number;
    brand?: { data: ProductBrand };
    category?: { data: ProductCategory };
    cover_image?: string;
  };
}
export interface Product_Plain {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  name: string;
  description?: string;
  specifications: ProductSpecification_Plain[];
  eco_data: EcoData_Plain[];
  price: number;
  brand?: ProductBrand_Plain;
  category?: ProductCategory_Plain;
  cover_image?: string;
}

export interface Product_NoRelations {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  name: string;
  description?: string;
  specifications: ProductSpecification_NoRelations[];
  eco_data: EcoData_NoRelations[];
  price: number;
  brand?: number;
  category?: number;
  cover_image?: string;
}

export interface Product_AdminPanelLifeCycle {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  name: string;
  description?: string;
  specifications: ProductSpecification_Plain[];
  eco_data: EcoData_Plain[];
  price: number;
  brand?: AdminPanelRelationPropertyModification<ProductBrand_Plain>;
  category?: AdminPanelRelationPropertyModification<ProductCategory_Plain>;
  cover_image?: string;
}
