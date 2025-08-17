import { List, Datagrid, TextField, NumberField, EditButton, DeleteButton, Edit, SimpleForm, TextInput, NumberInput, Create, useNotify, useRedirect, useDataProvider, required } from 'react-admin';

// Danh sách comment
import { SelectInput } from 'react-admin';

export const CommentList = () => (
    <List title="Quản lý đánh giá">
        <Datagrid rowClick="edit">
            <NumberField source="id" label="ID" />
            <TextField source="product.productName" label="Sản phẩm" />
            <TextField source="user.userName" label="Người dùng" />
            <NumberField source="rating" label="Đánh giá" />
            <TextField source="comment" label="Nội dung" />
            <TextField source="status" label="Trạng thái" />
            <EditButton label="Sửa"/>
            <DeleteButton label="Xóa" />
        </Datagrid>
    </List>
);

// Tạo mới comment
export const CommentCreate = () => {
    const notify = useNotify();
    const redirect = useRedirect();
    const dataProvider = useDataProvider();

    const handleSubmit = async (values: any) => {
        try {
            await dataProvider.create('comments', { data: values });
            notify('Tạo bình luận thành công', { type: 'success' });
            redirect('list', 'comments');
        } catch (error: any) {
            notify(error.message || 'Có lỗi khi tạo bình luận', { type: 'error' });
        }
    };
    return (
        <Create title="Thêm bình luận">
            <SimpleForm onSubmit={handleSubmit}>
                <NumberInput source="productId" label="ID Sản phẩm" validate={[required()]} />
                <TextInput source="productName" label="Tên sản phẩm" validate={[required()]} />
                <TextInput source="userName" label="Người dùng" validate={[required()]} />
                <NumberInput source="rating" label="Đánh giá" validate={[required()]} />
                <TextInput source="comment" label="Nội dung" validate={[required()]} />
                <SelectInput source="status" label="Trạng thái" choices={[
                    { id: 'active', name: 'Hoạt động' },
                    { id: 'hidden', name: 'Ẩn' },
                    { id: 'pending', name: 'Chờ duyệt' },
                ]} defaultValue="active" />
            </SimpleForm>
        </Create>
    );
};

// Sửa comment
// Sửa comment
import { useParams } from "react-router-dom";

export const CommentEdit = () => {
    const notify = useNotify();
    const redirect = useRedirect();
    const dataProvider = useDataProvider();
    const { id } = useParams();

    const handleSubmit = async (values: any) => {
        try {
            await dataProvider.update('recommendations', { id: id, data: values, previousData: values });
            notify('Cập nhật bình luận thành công', { type: 'success' });
            redirect('list', 'recommendations');
        } catch (error: any) {
            notify(error.message || 'Có lỗi khi cập nhật bình luận', { type: 'error' });
        }
    };
    // Hàm chuyển đổi dữ liệu từ backend về form (flatten)
    const transformRecord = (record: any) => {
        if (!record) return record;
        return {
            ...record,
            productName: record.product?.productName,
            userName: record.user?.userName
        };
    };

    // Khi submit thì map lại về dạng backend cần
    const transformSubmit = (values: any) => {
        const productId = values.product?.id;
        const submitData: any = {
            ...values,
            id: id, // luôn lấy id từ URL
            user: { userName: values.userName },
        };
        if (productId) {
            submitData.product = { id: productId };
        }
        return submitData;
    };

    return (
        <Edit title="Sửa bình luận" transform={transformSubmit}>
            <SimpleForm onSubmit={handleSubmit} defaultValues={transformRecord}>
                <NumberInput source="id" label="ID" disabled />
                <TextInput source="productName" label="Tên sản phẩm" validate={[required()]} disabled />
                <TextInput source="userName" label="Người dùng" validate={[required()]} />
                <NumberInput source="rating" label="Đánh giá" validate={[required()]} />
                <TextInput source="comment" label="Nội dung" validate={[required()]} />
                <SelectInput source="status" label="Trạng thái" choices={[
                    { id: 'active', name: 'Hoạt động' },
                    { id: 'hidden', name: 'Ẩn' },
                    { id: 'pending', name: 'Chờ duyệt' },
                ]} />
            </SimpleForm>
        </Edit>
    );
};
