import axios from 'axios';
import {
    CreateParams, CreateResult, DataProvider, DeleteManyParams, DeleteManyResult, DeleteParams, DeleteResult,
    GetListParams, GetManyParams, GetManyReferenceParams, GetManyReferenceResult, GetManyResult, GetOneParams, GetOneResult,
    Identifier, QueryFunctionContext, RaRecord, UpdateManyParams, UpdateManyResult, UpdateParams, UpdateResult
} from 'react-admin';

const apiUrl = 'http://localhost:8900/api';

// Cấu hình mặc định cho axios
axios.defaults.withCredentials = true;

const httpClient = {
    get: (url: string) => {
        const token = localStorage.getItem('token');
        console.log('Making request to:', url);
        
        return axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            withCredentials: true
        })
        .then(response => ({ json: { data: response.data } }))
        .catch(error => {
            console.error('Request failed:', error.response || error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return Promise.reject(error);
            }
            throw error;
        });
    },

    post: (url: string, data: any) => {
        const token = localStorage.getItem('token');
        const headers: any = {
            'Authorization': `Bearer ${token}`,
        };

        // Chỉ thêm Content-Type nếu không phải FormData
        if (!(data instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        
        return axios.post(url, data, {
            headers,
            withCredentials: true
        })
        .then(response => ({ json: { data: response.data } }))
        .catch(error => {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            throw error;
        });
    },

    put: (url: string, data: any) => {
        const token = localStorage.getItem('token');
        const headers: any = {
            'Authorization': `Bearer ${token}`,
        };

        // Nếu là FormData, đảm bảo không set Content-Type để browser tự thêm boundary
        if (!(data instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        console.log('PUT request:', {
            url,
            data: data instanceof FormData ? 'FormData' : data,
            headers
        });

        return axios.put(url, data, {
            headers,
            withCredentials: true
        })
        .then(response => {
            console.log('PUT response:', response.data);
            return { json: { data: response.data } };
        })
        .catch(error => {
            console.error('PUT error:', error.response || error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            throw error;
        });
    },

    delete: (url: string) => {
        const token = localStorage.getItem('token');

        return axios.delete(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            withCredentials: true
        })
        .then(response => ({ json: { data: response.data } }))
        .catch(error => {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            throw error;
        });
    }
};

export const dataProvider: DataProvider = {
    getList: (resource: string, params: GetListParams) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        
        let url = `${apiUrl}`;
        
        // Xử lý các resource khác nhau
        switch(resource) {
            case 'products':
                url += '/catalog/products';
                break;
            case 'users':
                url += '/accounts/users';
                break;
            case 'categories':
                url += '/catalog/categories';
                break;
            case 'brands':
                url += '/catalog/brands';
                break;
            case 'shop/order':
                url += '/shop/order';
                url += `?page=${page - 1}&size=${perPage}&sort=${field},${order}`;
                break;
            case 'recommendations':
                if (params.filter && params.filter.name) {
                    url += '/review/recommendations?name=' + encodeURIComponent(params.filter.name);
                } else {
                    url += '/review/recommendations/all';
                }
                break;
            default:
                url += `/${resource}`;
        }

        // Thêm query parameters nếu cần
        // Đã xử lý riêng cho recommendations và shop/order ở trên, các resource khác giữ nguyên

        return httpClient.get(url)
            .then(({ json }) => {
                let data, total;
                // Lấy object thực tế từ backend (do httpClient bọc lại trong .data)
                const result = json.data || json;
                if (Array.isArray(result)) {
                    data = result;
                    total = result.length;
                } else if (Array.isArray(result.data)) {
                    data = result.data;
                    total = result.total || result.data.length;
                } else if (Array.isArray(result.content)) {
                    data = result.content;
                    total = result.totalElements || result.content.length;
                } else {
                    data = [];
                    total = 0;
                }
                return { data, total };
            });
    },

    getOne: (resource: string, params: GetOneParams) => {
        let url = `${apiUrl}`;

        switch(resource) {
            case 'products':
                url += `/catalog/products/${params.id}`;
                break;
            case 'users':
                url += `/accounts/users/${params.id}`;
                break;
            case 'categories':
                url += `/catalog/categories/${params.id}`;
                break;
            case 'brands':
                url += `/catalog/brands/${params.id}`;
                break;
            case 'recommendations':
                url += `/review/recommendations/${params.id}`;
                break;
            default:
                url += `/${resource}/${params.id}`;
        }

        return httpClient.get(url)
            .then(({ json }) => {
                console.log('getOne json', json); // Thêm dòng này
                let data;
                if (resource === 'brands') {
                    // brands trả về { data: {...} }
                    data = json.data || json;
                    if (data && data.id) data.id = String(data.id); // Ép id thành chuỗi
                    if (!data.id && params.id) data.id = String(params.id);
                    console.log('getOne sẽ trả về:', data);
                    return { data };
                } else {
                    data = json.data || json;
                    if (!data.id && (data.categoryId || data.brandId)) {
                        data.id = data.categoryId || data.brandId;
                    }
                    if (!data.id && params.id) {
                        data.id = params.id;
                    }
                    console.log('getOne sẽ trả về:', data);
                }
                console.log('getOne sẽ trả về:', data);

                return { data };
            });
    },
   

    getMany: (resource: string, params: any) => {
        let url = `${apiUrl}`;
        switch(resource) {
            case 'categories':
                url += '/catalog/categories';
                break;
            case 'brands':
                url += '/catalog/brands';
                break;
            default:
                url += `/${resource}`;
        }
        return httpClient.get(url)
            .then(({ json }) => {
                if (Array.isArray(json)) {
                    return { data: json.map(item => ({
                        ...item,
                        id: item.id ?? item.brandId ?? item.categoryId
                    })) };
                }
                if (Array.isArray(json.data)) {
                    return { data: json.data.map(item => ({
                        ...item,
                        id: item.id ?? item.brandId ?? item.categoryId
                    })) };
                }
                return { data: [] };
            });
    },

    create: async (resource: string, params: CreateParams) => {
        let url = `${apiUrl}`;
        // Xử lý URL đặc biệt cho từng resource
        switch(resource) {
            case 'products':
                url += '/catalog/admin/products';
                break;
            case 'users':
                url += '/accounts/users';
                break;
            case 'categories':
                url += '/catalog/admin/categories';
                break;
            case 'brands':
                url += '/catalog/admin/brands';
                break;
            case 'recommendations':
                url += '/review/recommendations';
                break;
            default:
                url += `/${resource}`;
        }
        if (resource === 'brands' || resource === 'categories') {
            // 1. Tạo brand hoặc category trước (không có ảnh)
            const { json } = await httpClient.post(url, params.data);
            let data = json.data || json;
            console.log('[DEBUG] Brand/Category create response:', data);
            // Đảm bảo luôn lấy được id
            if (!data.id && data.data?.id) {
                data = data.data;
            }
            if (!data.id && (data.brandId || data.categoryId)) {
                data.id = data.brandId || data.categoryId;
            }
            if (!data.id && params.data.id) {
                data.id = params.data.id;
            }
            // 2. Nếu có ảnh, upload ảnh sau khi tạo brand hoặc category
            if (params.data.image?.rawFile && data.id) {
                const formData = new FormData();
                formData.append('image', params.data.image.rawFile);
                const imageUploadUrl = `${apiUrl}/catalog/admin/${resource}/${data.id}/image`;
                try {
                    const { json: imageJson } = await httpClient.post(imageUploadUrl, formData);
                    // Ưu tiên lấy imageUrl từ imageJson.imageUrl, nếu không có thì lấy imageJson.data.imageUrl
                    if (imageJson?.imageUrl) {
                        data.imageUrl = imageJson.imageUrl;
                    } else if (imageJson?.data?.imageUrl) {
                        data.imageUrl = imageJson.data.imageUrl;
                    }
                } catch (error) {
                    console.error(`Failed to upload ${resource} image:`, error);
                }
            }
            
            // Đảm bảo response có đúng định dạng { data: { id: ..., ... } }
            if (!data.id && data.data?.id) {
                data = data.data;
            }
            
            return { data };
        }
        console.log('[DEBUG] Brand params.data:', params.data);
        // Xử lý cho các resource khác (products, ...)
        if (resource === 'products' && params.data.image) {
            const formData = new FormData();
            const { image, ...productData } = params.data;
            if (image.rawFile) {
                formData.append('image', image.rawFile);
            }
            Object.keys(productData).forEach(key => {
                formData.append(key, productData[key]);
            });
            const { json } = await httpClient.post(url, formData);
            return { data: json.data };
        }
    
        // Xử lý cho categories và các resource khác
        const { json } = await httpClient.post(url, params.data);
        const data = json.data || json;
        
        if (!data || !data.id) {
            throw new Error("The response to 'create' must be like { data: { id: 123, ... } }, but the received data does not have an 'id' key.");
        }
    
        // Xử lý upload ảnh cho category
        if (resource === 'categories' && params.data.image?.rawFile) {
            const formData = new FormData();
            formData.append('image', params.data.image.rawFile);
            const imageUploadUrl = `${apiUrl}/catalog/admin/categories/${data.id}/image`;
            try {
                const { json: imageJson } = await httpClient.post(imageUploadUrl, formData);
                if (imageJson?.imageUrl) {
                    data.imageUrl = imageJson.imageUrl;
                }
            } catch (error) {
                console.error('Failed to upload category image:', error);
            }
        }
    
        return { data };
    },

    update: async (resource: string, params: UpdateParams) => {
        console.log('UPDATE called', resource, params);
    let url = `${apiUrl}`;
    if (resource === 'products') {
        url += `/catalog/admin/products/${params.id}`;
    } else if (resource === 'recommendations') {
        url += `/review/recommendations/${params.id}`;
    } else if (resource === 'users') {
        url += `/users/${params.id}`;
    } else if (resource === 'categories') {
        url += `/catalog/admin/categories/${params.id}`;
    } else if (resource === 'brands') {
        url += `/catalog/admin/brands/${params.id}`;
    } else {
        url += `/${resource}/${params.id}`;
    }
    console.log('UPDATE called', resource, params);
    const token = localStorage.getItem('token');
    let response, data;

    if (resource === 'categories') {
    const formData = new FormData();
    const { name, description, brandIds, image } = params.data;
    if (name) formData.append('name', name);
    if (description) formData.append('description', description);
    if (Array.isArray(brandIds)) {
        brandIds.forEach((brandId: number) => {
            formData.append('brandIds', String(brandId));
        });
    }
    if (image && image.rawFile) {
        formData.append('image', image.rawFile);
    }
    response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    data = json.data || json;
    if (json.imageUrl) {
        data.imageUrl = json.imageUrl;
    }
} else if (resource === 'brands') {
    const formData = new FormData();
    const { name, description, categoryIds, image } = params.data;
    if (name) formData.append('name', name);
    if (description) formData.append('description', description);
    if (Array.isArray(categoryIds)) {
        categoryIds.forEach((categoryId: number) => {
            formData.append('categoryIds', String(categoryId));
        });
    }
    if (image && image.rawFile) {
        formData.append('image', image.rawFile);
    }
    response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    data = json.data || json;
    if (json.imageUrl) {
        data.imageUrl = json.imageUrl;
    }
} else {
        response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params.data),
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let json = null;
        try {
            json = await response.json();
            data = json.data || json;
        } catch (e) {
            data = { id: params.id };
        }
    }
    return { data };
},


    'delete': (resource: string, params: DeleteParams) => {
    let url = `${apiUrl}`;
    // Khi xóa brand/category (many-to-many), backend sẽ tự xử lý xóa liên kết với bảng liên quan (category_brand hoặc brand_category)
    switch(resource) {
        case 'products':
            url += `/catalog/admin/products/${params.id}`;
            break;
        case 'users':
            url += `/accounts/users/${params.id}`;
            break;
        case 'categories':
            url += `/catalog/admin/categories/${params.id}`;
            break;
        case 'brands':
            url += `/catalog/admin/brands/${params.id}`;
            break;
        case 'recommendations':
            url += `/review/recommendations/${params.id}`;
            break;
        default:
            url += `/${resource}/${params.id}`;
    }
    return httpClient.delete(url)
        .then(({ json }) => {
            // Nếu backend trả về json.data là bản ghi đã xóa, dùng luôn; nếu không, fallback về { id: params.id }
            if (json && json.data) {
                return { data: json.data };
            }
            return { data: { id: params.id } };
        })
        .catch(error => {
            // Nếu backend trả về lỗi (ví dụ 400), trả về lỗi rõ ràng để notify
            let message = 'Xóa thất bại';
            if (error?.response?.data) {
                // Nếu backend trả về message rõ ràng
                message = typeof error.response.data === 'string' ? error.response.data : (error.response.data.message || message);
            }
            throw new Error(message);
        });
},


    updateMany: (resource: string, params: UpdateManyParams) => {
        const promises = params.ids.map(id => 
            dataProvider.update(resource, { 
                id: id as Identifier, 
                data: params.data,
            })
        );
        return Promise.all(promises)
            .then(() => ({ data: params.ids }));
    },
};
export default dataProvider;