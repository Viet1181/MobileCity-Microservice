import { List, Datagrid, TextField, DeleteButton, EditButton, Create, Edit, SimpleForm, TextInput, FileInput, FileField, useRecordContext, SelectArrayInput, useGetList, useNotify, useRedirect } from "react-admin";
import React from "react";

const CustomEditButton = () => {
    const record = useRecordContext();
    const navigate = useNavigate();

    const handleEdit = (event: React.MouseEvent) => {
        event.stopPropagation();
        console.log('Edit button clicked for product:', record.id);
        navigate(`/brands/${record.id}/edit`);
    };

    return (
        <Button onClick={handleEdit} variant="contained" color="primary">
            Sửa
        </Button>
    );
};

const BrandImageField = ({ source, label }: { source: string; label?: string }) => {
    const record = useRecordContext();
    if (!record || !record[source]) {
        return <span>{label || 'Không có logo'}</span>;
    }
    const imageUrl = `http://localhost:8900/api/catalog/images/${record[source]}`;
    return (
        <a href={imageUrl} target="_blank" rel="noopener noreferrer">
            <img src={imageUrl} alt={record.name || label || 'Logo'} style={{ width: 80, height: 'auto', objectFit: 'contain', borderRadius: 4 }} />
        </a>
    );
};

export const BrandList = () => {
    // Lấy danh sách categories để tìm ngược lại
    const { data: categories = [], isLoading: isLoadingCategories } = useGetList('categories');
    
    // Tạo một bản đồ để lưu trữ danh sách tên danh mục theo ID
    const categoryMap = React.useMemo(() => {
        const map: Record<number, string> = {};
        categories.forEach(cat => {
            map[cat.id] = cat.name;
        });
        return map;
    }, [categories]);

    // Tạo một bản đồ lưu trữ danh sách categoryIds cho mỗi brandId
    const brandToCategoriesMap = React.useMemo(() => {
        const map: Record<number, number[]> = {};
        
        // Duyệt qua tất cả các category
        categories.forEach(cat => {
            // Duyệt qua tất cả các brandId trong category
            if (cat.brandIds && Array.isArray(cat.brandIds)) {
                cat.brandIds.forEach(brandId => {
                    if (!map[brandId]) {
                        map[brandId] = [];
                    }
                    // Thêm categoryId vào danh sách của brand
                    if (!map[brandId].includes(cat.id)) {
                        map[brandId].push(cat.id);
                    }
                });
            }
        });
        return map;
    }, [categories]);

    // Component để hiển thị danh sách tên danh mục
    const CategoriesField = ({ record }: { record: any }) => {
        if (isLoadingCategories) return <span>Đang tải...</span>;
        if (!record || !record.id) return <span>Không có dữ liệu</span>;
        
        // Lấy danh sách categoryIds từ bản đồ đã tạo
        const categoryIds = brandToCategoriesMap[record.id] || [];
        
        // Lấy tên các danh mục từ categoryMap
        const categoryNames = categoryIds
            .map(catId => categoryMap[catId])
            .filter(Boolean);

        if (categoryNames.length === 0) {
            return <span>Không có danh mục</span>;
        }
        
        return (
            <div>
                {categoryNames.map((name: string, index: number) => (
                    <React.Fragment key={index}>
                        {name}
                        {index < categoryNames.length - 1 ? ', ' : ''}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    // Hook notify
    const notify = useNotify();

    // Hàm xử lý lỗi xóa thương hiệu
    const handleBrandDeleteError = (error: any) => {
        let msg = 'Xóa thương hiệu thất bại';
        if (error?.body && typeof error.body === 'string' && error.body.includes('Không thể xóa thương hiệu')) {
            msg = error.body;
        } else if (error?.message && error.message.includes('Không thể xóa thương hiệu')) {
            msg = error.message;
        } else if (error?.status === 400) {
            msg = 'Không thể xóa thương hiệu vì vẫn còn sản phẩm thuộc thương hiệu này!';
        }
        notify(msg, { type: 'warning' });
    };

    return (
        <List title="Danh sách thương hiệu">
            <Datagrid>
                <TextField source="id" label="ID" />
                <TextField source="name" label="Tên thương hiệu" />
                {/* <CategoriesField label="Danh mục" /> */}
                <BrandImageField source="imageUrl" label="Logo" />
                <EditButton label="Sửa"/>
                <DeleteButton label="Xóa" mutationOptions={{
                    onError: handleBrandDeleteError
                }} />
            </Datagrid>
        </List>
    );
};
import { FormDataConsumer } from "react-admin";
import { Button } from "@mui/material";
import { useNavigate } from "react-router";

export const BrandCreate = () => {
    const { data: categories = [], isLoading } = useGetList('categories');
    const notify = useNotify();
    const redirect = useRedirect();
    const onSuccess = () => {
        notify('Thêm thương hiệu thành công!');
        redirect('/brands');
    };
    return (
        <Create mutationOptions={{ onSuccess }}>
            <SimpleForm>
                <TextInput source="name" label="Tên thương hiệu" required placeholder="Nhập tên thương hiệu" />
                <TextInput source="description" label="Mô tả" multiline rows={3} placeholder="Nhập mô tả" />
                <SelectArrayInput
                    source="categoryIds"
                    label="Danh mục liên kết"
                    choices={categories}
                    optionText="name"
                    optionValue="id"
                    disabled={isLoading}
                    placeholder="Chọn danh mục liên kết"
                />
                <FileInput source="image" label="Logo thương hiệu" accept="image/*" placeholder="Chọn file ảnh">
                    <FileField source="src" title="Tên file" />
                </FileInput>
                {/* Hiển thị dữ liệu form để debug */}
                <FormDataConsumer>
                    {({ formData }) => (
                        <pre style={{ background: '#f7f7f7', fontSize: 12 }}>{JSON.stringify(formData, null, 2)}</pre>
                    )}
                </FormDataConsumer>
            </SimpleForm>
        </Create>
    );
};
export const BrandEdit = (props: any) => {
    console.log('BrandEdit props', props);
    const { data: categories = [], isLoading } = useGetList('categories');
 
    return (
        <Edit {...props} title="Chỉnh sửa thương hiệu">
            <SimpleForm>
                <TextInput source="name" label="Tên thương hiệu" required placeholder="Nhập tên thương hiệu" />
                <TextInput source="description" label="Mô tả" multiline rows={3} placeholder="Nhập mô tả" />
                <SelectArrayInput
                    source="categoryIds"
                    label="Danh mục liên kết"
                    choices={categories}
                    optionText="name"
                    optionValue="id"
                    disabled={isLoading}
                    placeholder="Chọn danh mục liên kết"
                />
                <FileInput
                    source="image"
                    label="Logo thương hiệu"
                    accept="image/*,.jpg,.jpeg,.png."
                    placeholder="Chỉ chọn file ảnh (jpg, jpeg, png)"
                    validate={[ (value) => {
                        if (!value || !value.rawFile) return undefined;
                        const allowedTypes = [
                            'image/jpeg', 'image/png', 'image/jpg'
                        ];
                        if (!allowedTypes.includes(value.rawFile.type)) {
                            return 'Chỉ chấp nhận file ảnh (jpg, png)!';
                        }
                        return undefined;
                    } ]}
                >
                    <FileField source="src" title="Tên file" />
                </FileInput>
            </SimpleForm>
        </Edit>
    );
};
