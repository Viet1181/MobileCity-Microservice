import { List, Datagrid, TextField, DeleteButton, EditButton, Create, Edit, SimpleForm, TextInput, FileInput, FileField, useRecordContext, useNotify, useRedirect } from "react-admin";
import { Link as RouterLink } from "react-router-dom";
import React from "react";

const CategoryImageField = ({ source, label }: { source: string; label?: string }) => {
    const record = useRecordContext();
    if (!record || !record[source]) {
        return <span>{label || 'Không có ảnh'}</span>;
    }
    const imageUrl = `http://localhost:8900/api/catalog/images/${record[source]}`;
    return (
        <a href={imageUrl} target="_blank" rel="noopener noreferrer">
            <img src={imageUrl} alt={record.name || label || 'Ảnh'} style={{ width: 80, height: 'auto', objectFit: 'contain', borderRadius: 4 }} />
        </a>
    );
};

export const CategoryList = () => (
    <List>
        <Datagrid>
            <TextField source="id" label="ID" />
            <TextField source="name" label="Tên danh mục" />
            <CategoryImageField source="imageUrl" />
            <EditButton label="Sửa"/>
            <DeleteButton label="Xóa" />
        </Datagrid>
    </List>
);

export const CategoryCreate = () => {
    const notify = useNotify();
    const redirect = useRedirect();
    const onSuccess = () => {
        notify('Thêm danh mục thành công');
        redirect('/categories');
    };
    return (
        <Create mutationOptions={{ onSuccess }}>
            <SimpleForm>
                <TextInput source="name" label="Tên danh mục" />
                <TextInput source="description" label="Mô tả" />
                <FileInput
    source="image"
    label="Ảnh danh mục"
    accept="image/*,.jpg,.jpeg,.png."
    placeholder="Chỉ chọn file ảnh (.jpg, .jpeg, .png.)"
    validate={[(value) => {
        if (!value || !value.rawFile) return undefined;
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/jpg'
        ];
        if (!allowedTypes.includes(value.rawFile.type)) {
            return 'Chỉ chấp nhận file ảnh (jpg, png)!';
        }
        return undefined;
    }]}
>
    <FileField source="src" title="title" />
</FileInput>
            </SimpleForm>
        </Create>
    );
};

export const CategoryEdit = () => (
    <Edit>
      <SimpleForm>
        <TextInput source="name" label="Tên danh mục" />
        <TextInput source="description" label="Mô tả" />
        <FileInput
          source="image"
          label="Ảnh danh mục"
          accept="image/*,.jpg,.jpeg,.png."
          placeholder="Chỉ chọn file ảnh (.jpg, .jpeg, .png,)"
        >
          <FileField source="src" title="title" />
        </FileInput>
      </SimpleForm>
    </Edit>
);