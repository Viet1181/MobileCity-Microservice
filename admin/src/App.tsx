import { Admin, Resource,  CustomRoutes } from "react-admin";
import { Route } from "react-router-dom";
import { Layout } from "./Layout";

import Inventory2Icon from "@mui/icons-material/Inventory2";

import PersonIcon from "@mui/icons-material/Person";
import dataProvider from "./dataProvider";
import { Dashboard } from "./Dashboard";
import { authProvider } from "./authProvider";

import { ProductCreate, ProductEdit, ProductList } from "./component/Product";
import { UserList, UserCreate, UserEdit } from "./component/User";
import ProductImageUpdate from "./component/ProductImageUpdate";
import { CommentList, CommentCreate, CommentEdit } from './component/Comment';

import { OrderList, OrderEdit, OrderShow } from './component/Order';
import { LocalShipping as OrderIcon } from '@mui/icons-material';
import { CategoryList, CategoryCreate, CategoryEdit } from './component/Category';
import CategoryIcon from './component/CategoryIcon';
import { BrandList, BrandCreate, BrandEdit } from './component/Brand';
import BrandIcon from './component/BrandIcon';

export const App = () => (
    <Admin authProvider={authProvider} layout={Layout} dataProvider={dataProvider} dashboard={Dashboard}>
        <Resource
            name="categories"
            list={CategoryList}
            create={CategoryCreate}
            edit={CategoryEdit}
            icon={CategoryIcon}
            options={{ label: "Danh mục" }}
        />
        <Resource
            name="brands"
            list={BrandList}
            create={BrandCreate}
            edit={BrandEdit}
            icon={BrandIcon}
            options={{ label: "Thương hiệu" }}
        />
        <Resource
            name="products"
            list={ProductList}
            create={ProductCreate}
            edit={ProductEdit}
            icon={Inventory2Icon}
            options={{ label: "Sản phẩm" }}
        />
        <Resource
            name="users"
            list={UserList}
            create={UserCreate}
            edit={UserEdit}
            icon={PersonIcon}
            options={{ label: "Người dùng" }}
        />
    
    <Resource
    name="shop/order"
    list={OrderList}
    edit={OrderEdit}
    show={OrderShow}
    icon={OrderIcon}
    options={{ label: "Đơn hàng" }}
/>

<Resource
  name="recommendations"
  list={CommentList}
  create={CommentCreate}
  edit={CommentEdit}
options={{ label: "Đánh giá" }}
/>

<CustomRoutes>
            <Route path="/products/:id/update-image" element={<ProductImageUpdate />} />
        </CustomRoutes>
    </Admin>
);