import { Avatar, Box, Card, CardContent, CardHeader, CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { authProvider } from "./authProvider";
import { blue } from "@mui/material/colors";

export const Dashboard = () => {

    const [authStatus, setAuthStatus] = useState("Not Authenticated");

    useEffect(() => {
        authProvider.checkAuth()
        .then(() => setAuthStatus("Authenticated"))
        .catch(() => setAuthStatus("Not Authenticated"));
    }, []);

    return (
        <Grid container justifyContent="center" style={{marginTop:50}}>
            <Grid item xs={12} md={8} lg={6}>
            <Card style={{
                borderRadius: 16,
                boxShadow: "0 4px 20px rgbb(0,0,0.1)",
                background: `linear-gradient(135deg, ${blue[500]} 30%, ${blue[300]} 90% )`,
                color: "white",
            }}>
                <CardHeader
                    avatar = {
                        <Avatar sx = {{bgcolor: "white",
                            color: blue[500],
                        }}>
                            A
                        </Avatar>
                    }
                    title="Chào mừng đến với trang admin"
                    titleTypographyProps={{variant: 'h5', fontWeight: 'bold'}}/>
                    <CardContent>
                        <Typography variant="body1" style={{ marginBottom: 16 }}>
                           Chào mừng đến với trang admin của bạn
                            
                        </Typography>
                    </CardContent>
                    <CardContent>
                    {authStatus === null ? (
                        <Box display="flex" alignItems = "center">
                            <CircularProgress size={24} style={{color:"white", marginRight: 8}}/>
                            <Typography variant="body2">Đang kiểm tra thông tin đăng nhập...</Typography>
                        </Box>
                    ) : (
                        <Typography variant="h6" style={{fontWeight: "bold"}}>
                           
                            {authStatus === "Authenticated" ? (
                                <Typography variant="body2" style={{color:"white", marginTop: 8}}>
                                    Bạn đã đăng nhập thành công!
                                </Typography>
                            ) : (
                                <Typography variant="body2" style={{color:"white", marginTop: 8}}>
                                    Bạn chưa đăng nhập!
                                </Typography>
                            )}
                        </Typography>
                    )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};