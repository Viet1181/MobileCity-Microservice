import { 
    List, Edit, SimpleForm, TextInput, TextField, DateField, NumberField,
    SelectInput, useNotify, useRedirect, useDataProvider, required,
    Show, SimpleShowLayout, ArrayField, Datagrid, useRecordContext
} from 'react-admin';

// Hiển thị trạng thái đơn hàng tiếng Việt trong form chỉnh sửa
const OrderStatusDisplay = () => {
    const record = useRecordContext();
    function renderStatus(status: string) {
        switch (status) {
            case "PENDING": return "Đang xử lý";
            case "PAID": return "Đã thanh toán";
            case "DELIVERED": return "Đã giao hàng";
            case "DELIVERING": return "Đang giao hàng";
            case "CANCELLED": return "Đã hủy";
          
        
            default: return status || "";
        }
    }
    if (!record) return null;
    return (
        <div style={{fontWeight:'bold', color:'#222', margin:'8px 0'}}>
            Trạng thái hiện tại: {renderStatus(record.status)}
        </div>
    );
};

// CustomImageField: hiển thị ảnh động dựa trên product.imageUrl
const CustomImageField = (props: any) => {
    const record = props.record ?? props;
    const url = record?.product?.imageUrl ? `/api/images/${record.product.imageUrl}` : '';
    return url ? (
        <img src={url} alt={record?.product?.productName || ''} style={{ maxHeight: 80, maxWidth: 80 }} />
    ) : null;
};

import { Pagination } from 'react-admin';

export const OrderList = () => (
    <List pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}>
        <Datagrid rowClick="edit">
            <TextField source="id" label="Mã đơn hàng" />
            <DateField source="orderedDate" label="Ngày đặt hàng" />
            <TextField source="status" label="Trạng thái" />
            <NumberField 
                source="total" 
                label="Tổng tiền"
                options={{ 
                    style: 'currency', 
                    currency: 'VND',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }}
            />
            <TextField source="user.userName" label="Người đặt" />
        </Datagrid>
    </List>
);

export const OrderShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" label="Mã đơn hàng" />
            <DateField source="orderedDate" label="Ngày đặt hàng" />
            <TextField source="status" label="Trạng thái" />
            <NumberField source="total" label="Tổng tiền" options={{ style: 'currency', currency: 'VND' }} />
            <TextField source="user.userName" label="Người đặt" />
            <ArrayField source="items" label="Danh sách sản phẩm">
                <Datagrid>
                    <TextField source="product.id" label="Mã SP" />
                    <TextField source="product.productName" label="Tên sản phẩm" />
                    <CustomImageField />
                    <NumberField source="product.price" label="Giá" options={{ style: 'currency', currency: 'VND' }} />
                    <NumberField source="quantity" label="Số lượng" />
                    <NumberField source="subTotal" label="Thành tiền" options={{ style: 'currency', currency: 'VND' }} />
                </Datagrid>
            </ArrayField>
        </SimpleShowLayout>
    </Show>
);

export const OrderEdit = () => {
    const notify = useNotify();
    const redirect = useRedirect();
    const dataProvider = useDataProvider();

    const handleSave = async (values: any, previousData: any) => {
        try {
            const orderId = values.id;
            console.log('OrderEdit.handleSave values:', values);
            if (!orderId) {
                notify('Không tìm thấy ID đơn hàng!', { type: 'error' });
                return;
            }
            await dataProvider.update('shop/order', {
                id: orderId,
                data: { status: values.status },
                previousData
            });
            notify('Cập nhật trạng thái thành công', { type: 'success' });
            redirect('/shop/order');
        } catch (error) {
            notify('Cập nhật trạng thái thất bại', { type: 'error' });
        }
    };

    // Hàm chuyển trạng thái code sang tiếng Việt thân thiện
    const renderStatus = (status?: string) => {
      switch (status) {
        case "PENDING": return "Đang xử lý";
        case "PAID": return "Đã thanh toán";
        case "DELIVERED": return "Đã giao hàng";
        case "DELIVERING": return "Đang giao hàng";
        case "CANCELLED": return "Đã hủy";
      
      
        default: return status || "";
      }
    };

    return (
        <Edit mutationMode="pessimistic">
            <SimpleForm onSubmit={handleSave}>

                <TextInput source="id" label="Mã đơn hàng" InputProps={{ readOnly: true }} />
                <DateField source="orderedDate" label="Ngày đặt hàng" />
                <SelectInput source="status" label="Trạng thái" choices={[
                    { id: 'PENDING', name: 'Đang xử lý' },
                    { id: 'PAID', name: 'Đã thanh toán' },
                     { id: 'CANCELLED', name: 'Đã hủy' },
                        { id: 'DELIVERING', name: 'Đang giao hàng' },
                    { id: 'DELIVERED', name: 'Đã giao hàng' },
                  
                   
                 
                 
                ]} />
                {/* Hiển thị trạng thái tiếng Việt thân thiện */}
                <OrderStatusDisplay />
                <NumberField source="total" label="Tổng tiền" options={{ style: 'currency', currency: 'VND' }} />
                <TextField source="user.userName" label="Người đặt" />
                {/* Hiển thị danh sách sản phẩm trong đơn hàng */}
                <ArrayField source="items" label="Danh sách sản phẩm">
                    <Datagrid>
                        <TextField source="product.id" label="Mã SP" />
                        <TextField source="product.productName" label="Tên sản phẩm" />
                        <CustomImageField />
                        <NumberField source="product.price" label="Giá" options={{ style: 'currency', currency: 'VND' }} />
                        <NumberField source="quantity" label="Số lượng" />
                        <NumberField source="subTotal" label="Thành tiền" options={{ style: 'currency', currency: 'VND' }} />
                    </Datagrid>
                </ArrayField>
            </SimpleForm>
        </Edit>
    );
};


