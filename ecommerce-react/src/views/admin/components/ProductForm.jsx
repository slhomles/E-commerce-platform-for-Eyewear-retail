/* eslint-disable jsx-a11y/label-has-associated-control */
import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { ImageLoader } from '@/components/common';
import {
  CustomColorInput, CustomCreatableSelect, CustomInput, CustomTextarea, CustomSelect
} from '@/components/formik';
import {
  Field, FieldArray, Form, Formik
} from 'formik';
import { useFileHandler } from '@/hooks';
import PropType from 'prop-types';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import api from '@/services/api';

const typeOptions = [
  { value: 'FRAME', label: 'Frame' },
  { value: 'LENS', label: 'Lens' },
  { value: 'SERVICE', label: 'Service' }
];

const genderOptions = [
  { value: 'UNISEX', label: 'Unisex' },
  { value: 'MEN', label: 'Men' },
  { value: 'WOMEN', label: 'Women' },
  { value: 'KIDS', label: 'Kids' }
];

const shapeOptions = [
  { value: 'ROUND', label: 'Round' },
  { value: 'SQUARE', label: 'Square' },
  { value: 'RECTANGLE', label: 'Rectangle' },
  { value: 'AVIATOR', label: 'Aviator' },
  { value: 'CAT_EYE', label: 'Cat Eye' },
  { value: 'OVAL', label: 'Oval' },
  { value: 'WAYFARER', label: 'Wayfarer' }
];

const materialOptions = [
  { value: 'ACETATE', label: 'Acetate' },
  { value: 'METAL', label: 'Metal' },
  { value: 'PLASTIC', label: 'Plastic' },
  { value: 'WOOD', label: 'Wood' },
  { value: 'TITANIUM', label: 'Titanium' }
];

const FormSchema = Yup.object().shape({
  name: Yup.string()
    .required('Product name is required.')
    .max(100, 'Product name must only be less than 100 characters.'),
  brandId: Yup.string().required('Brand is required.'),
  categoryId: Yup.string().required('Category is required.'),
  type: Yup.string().required('Type is required.'),
  gender: Yup.string().required('Gender is required.'),
  frameShape: Yup.string(),
  frameMaterial: Yup.string(),

  basePrice: Yup.number()
    .positive('Price is invalid.')
    .required('Base Price is required.'),
  salePrice: Yup.number()
    .min(0, 'Sale Price is invalid.')
    .nullable(),

  description: Yup.string()
    .required('Description is required.'),

  // Specs
  lensWidth: Yup.number().positive('Must be positive').nullable(),
  bridgeWidth: Yup.number().positive('Must be positive').nullable(),
  templeLength: Yup.number().positive('Must be positive').nullable(),
  weightGram: Yup.number().positive('Must be positive').nullable(),

  initialStock: Yup.number()
    .positive('Initial stock is invalid.')
    .integer('Initial stock should be an integer.')
    .required('Initial stock is required.'),

  colorName: Yup.string().required('Color name is required'),
  colorHex: Yup.string()
});

const ProductForm = ({ product, onSubmit, isLoading }) => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [brandsRes, catRes] = await Promise.all([
          api.getBrands(),
          api.getCategories()
        ]);
        setBrands(brandsRes.map(b => ({ value: b.id, label: b.name })));
        setCategories(catRes.map(c => ({ value: c.id, label: c.name })));
      } catch (error) {
        console.error("Failed to load select options", error);
      }
    };
    fetchOptions();
  }, []);

  const initFormikValues = {
    name: product?.name || '',
    brandId: product?.brandId || '',
    categoryId: product?.categoryId || '',
    type: product?.type || 'FRAME',
    gender: product?.gender || 'UNISEX',
    frameShape: product?.frameShape || '',
    frameMaterial: product?.frameMaterial || '',

    basePrice: product?.basePrice || product?.price || 0,
    salePrice: product?.salePrice || 0,
    description: product?.description || '',

    lensWidth: product?.specs?.lensWidth || product?.sizes?.[0] || 0,
    bridgeWidth: product?.specs?.bridgeWidth || 0,
    templeLength: product?.specs?.templeLength || 0,
    weightGram: product?.specs?.weightGram || 0,

    initialStock: product?.maxQuantity || product?.variants?.[0]?.initialStock || product?.variants?.[0]?.stockAvailable || 0,
    colorName: product?.variants?.[0]?.colorName || product?.availableColors?.[0] || '',
    colorHex: product?.variants?.[0]?.colorHex || product?.availableColors?.[0] || '#000000'
  };

  const {
    imageFile,
    isFileLoading,
    onFileChange,
    removeImage
  } = useFileHandler({ image: {}, imageCollection: product?.imageCollection || product?.variants?.[0]?.imageGallery?.map((url, i) => ({ id: i, url })) || [] });

  const onSubmitForm = (form) => {
    if (imageFile.image.file || product?.image || product?.imageUrl) {
      onSubmit({
        ...form,
        image: imageFile?.image?.file || product?.imageUrl || product?.image,
        imageCollection: imageFile.imageCollection
      });
    } else {
      alert('Product thumbnail image is required.');
    }
  };

  return (
    <div>
      <Formik
        enableReinitialize
        initialValues={initFormikValues}
        validateOnChange
        validationSchema={FormSchema}
        onSubmit={onSubmitForm}
      >
        {({ values, setValues }) => (
          <Form className="product-form">
            <div className="product-form-inputs">
              <div className="d-flex">
                <div className="product-form-field">
                  <Field
                    disabled={isLoading}
                    name="name"
                    type="text"
                    label="* Product Name"
                    placeholder="E.g. RayBan Wayfarer Classic"
                    style={{ textTransform: 'capitalize' }}
                    component={CustomInput}
                  />
                </div>
              </div>

              <div className="d-flex">
                <div className="product-form-field">
                  <CustomSelect
                    name="categoryId"
                    options={categories}
                    disabled={isLoading || categories.length === 0}
                    placeholder="Select Category"
                    label="* Category"
                  />
                </div>
                &nbsp;
                <div className="product-form-field">
                  <CustomSelect
                    name="brandId"
                    options={brands}
                    disabled={isLoading || brands.length === 0}
                    placeholder="Select Brand"
                    label="* Brand"
                  />
                </div>
              </div>

              <div className="d-flex">
                <div className="product-form-field">
                  <CustomSelect
                    name="type"
                    options={typeOptions}
                    disabled={isLoading}
                    placeholder="Select Type"
                    label="* Type"
                  />
                </div>
                &nbsp;
                <div className="product-form-field">
                  <CustomSelect
                    name="gender"
                    options={genderOptions}
                    disabled={isLoading}
                    placeholder="Select Gender"
                    label="* Gender"
                  />
                </div>
              </div>

              <div className="product-form-field">
                <Field
                  disabled={isLoading}
                  name="description"
                  id="description"
                  rows={3}
                  label="* Product Description"
                  component={CustomTextarea}
                />
              </div>

              <div className="d-flex">
                <div className="product-form-field">
                  <Field
                    disabled={isLoading}
                    name="basePrice"
                    type="number"
                    label="* Base Price"
                    component={CustomInput}
                  />
                </div>
                &nbsp;
                <div className="product-form-field">
                  <Field
                    disabled={isLoading}
                    name="salePrice"
                    type="number"
                    label="Sale Price (Optional)"
                    component={CustomInput}
                  />
                </div>
              </div>

              <h4 className="margin-top-s">Physical Specifications</h4>
              <div className="d-flex">
                <div className="product-form-field">
                  <CustomSelect
                    name="frameShape"
                    options={shapeOptions}
                    disabled={isLoading}
                    placeholder="Select Shape"
                    label="Frame Shape"
                  />
                </div>
                &nbsp;
                <div className="product-form-field">
                  <CustomSelect
                    name="frameMaterial"
                    options={materialOptions}
                    disabled={isLoading}
                    placeholder="Select Material"
                    label="Frame Material"
                  />
                </div>
              </div>

              <div className="d-flex">
                <div className="product-form-field">
                  <Field
                    disabled={isLoading}
                    name="lensWidth"
                    type="number"
                    label="Lens Width (mm)"
                    component={CustomInput}
                  />
                </div>
                &nbsp;
                <div className="product-form-field">
                  <Field
                    disabled={isLoading}
                    name="bridgeWidth"
                    type="number"
                    label="Bridge Width (mm)"
                    component={CustomInput}
                  />
                </div>
              </div>

              <div className="d-flex">
                <div className="product-form-field">
                  <Field
                    disabled={isLoading}
                    name="templeLength"
                    type="number"
                    label="Temple Length (mm)"
                    component={CustomInput}
                  />
                </div>
                &nbsp;
                <div className="product-form-field">
                  <Field
                    disabled={isLoading}
                    name="weightGram"
                    type="number"
                    label="Weight (g)"
                    component={CustomInput}
                  />
                </div>
              </div>

              <h4 className="margin-top-s">Initial Variant Information</h4>
              <div className="d-flex">
                <div className="product-form-field">
                  <Field
                    disabled={isLoading}
                    name="colorName"
                    type="text"
                    label="* Color Name"
                    placeholder="E.g. Matte Black"
                    component={CustomInput}
                  />
                </div>
                &nbsp;
                <div className="product-form-field">
                  <Field
                    disabled={isLoading}
                    name="colorHex"
                    type="color"
                    label="Color Hex"
                    component={CustomInput}
                  />
                </div>
                &nbsp;
                <div className="product-form-field">
                  <Field
                    disabled={isLoading}
                    name="initialStock"
                    type="number"
                    label="* Initial Stock Qty"
                    component={CustomInput}
                  />
                </div>
              </div>

              <div className="product-form-field">
                <span className="d-block padding-s">Image Collection (Gallery)</span>
                {!isFileLoading && (
                  <label htmlFor="product-input-file-collection">
                    <input
                      disabled={isLoading}
                      hidden
                      id="product-input-file-collection"
                      multiple
                      onChange={(e) => onFileChange(e, { name: 'imageCollection', type: 'multiple' })}
                      readOnly={isLoading}
                      type="file"
                    />
                    Choose Images
                  </label>
                )}
              </div>
              <div className="product-form-collection">
                <>
                  {imageFile.imageCollection.length >= 1 && (
                    imageFile.imageCollection.map((image) => (
                      <div
                        className="product-form-collection-image"
                        key={image.id}
                      >
                        <ImageLoader
                          alt=""
                          src={image.url}
                        />
                        <button
                          className="product-form-delete-image"
                          onClick={() => removeImage({ id: image.id, name: 'imageCollection' })}
                          title="Delete Image"
                          type="button"
                        >
                          <i className="fa fa-times-circle" />
                        </button>
                      </div>
                    ))
                  )}
                </>
              </div>
              <br />
              <div className="product-form-field product-form-submit">
                <button
                  className="button"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? <LoadingOutlined /> : <CheckOutlined />}
                  &nbsp;
                  {isLoading ? 'Saving Product...' : 'Save Product'}
                </button>
              </div>
            </div>
            {/* ----THUMBNAIL ---- */}
            <div className="product-form-file">
              <div className="product-form-field">
                <span className="d-block padding-s">* Thumbnail / Main Image</span>
                {!isFileLoading && (
                  <label htmlFor="product-input-file">
                    <input
                      disabled={isLoading}
                      hidden
                      id="product-input-file"
                      onChange={(e) => onFileChange(e, { name: 'image', type: 'single' })}
                      readOnly={isLoading}
                      type="file"
                    />
                    Choose Image
                  </label>
                )}
              </div>
              <div className="product-form-image-wrapper">
                {(imageFile.image.url || product?.image || product?.imageUrl) && (
                  <ImageLoader
                    alt=""
                    className="product-form-image-preview"
                    src={imageFile.image.url || product?.image || product?.imageUrl}
                  />
                )}
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

ProductForm.propTypes = {
  product: PropType.shape({
    name: PropType.string,
    brandId: PropType.string,
    categoryId: PropType.string,
    description: PropType.string,
    price: PropType.number,
    basePrice: PropType.number,
    salePrice: PropType.number,
    type: PropType.string,
    gender: PropType.string,
    frameShape: PropType.string,
    frameMaterial: PropType.string,
    specs: PropType.object,
    sizes: PropType.array,
    variants: PropType.array,
    availableColors: PropType.array,
    image: PropType.string,
    imageUrl: PropType.string,
    imageCollection: PropType.array,
    maxQuantity: PropType.number
  }),
  onSubmit: PropType.func.isRequired,
  isLoading: PropType.bool.isRequired
};

export default ProductForm;
