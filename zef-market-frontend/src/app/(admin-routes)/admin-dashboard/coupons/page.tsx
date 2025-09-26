"use client";
import { useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import toast from "react-hot-toast";
import swal from "sweetalert";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PaginationComponent from "@/app/components/PaginationComponent";
import { useDeleteCouponAdminPageMutation, useGetCouponsAdminQuery, useUpdateCouponMutation } from "@/redux/slices/api/couponsApiSlice";

const AdminCategoriesPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data ,isLoading} = useGetCouponsAdminQuery(`?page=${currentPage}`);
  const [deleteCouponAdminPage] = useDeleteCouponAdminPageMutation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const updateCoupon = useUpdateCouponMutation();

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "serial",
      width: isSmallScreen ? 60 : 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "name",
      headerName: "name",
      flex: isSmallScreen ? 0.8 : 1,
      minWidth: isSmallScreen ? 120 : 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            whiteSpace: "normal",
            wordWrap: "break-word",
            lineHeight: 1.2,
            padding: "4px",
          }}
        >
          <Link
            href={`/?CategoryIdfromAdminDashBoard=${params.row.categoryId}`}
            style={{
              color: theme.palette.primary.main,
              textDecoration: "none",
            }}
          >
            {params.value}
          </Link>
        </Box>
      ),
    },
        {
      field: "expireDate",
      headerName: "Expire Date",
      flex: isSmallScreen ? 0.6 : 0.8,
      minWidth: isSmallScreen ? 80 : 120,
      align: "center",
      headerAlign: "center",
    },
            {
      field: "discount",
      headerName: "Discount",
      flex: isSmallScreen ? 0.6 : 0.8,
      minWidth: isSmallScreen ? 80 : 120,
      align: "center",
      headerAlign: "center",
    },
    
    {
      field: "actions",
      headerName: "Actions",
      flex: isSmallScreen ? 0.8 : 1,
      width: isSmallScreen ? 100 : 120,
      align: "center",
      headerAlign: "center",

      renderCell: (params: GridRenderCellParams<string[]>) => (
        <>
            <IconButton
            onClick={() =>
              router.push(
                `/admin-dashboard/coupons/edit-coupon/${params.value}`
              )
            }
          >
            <Edit color="info" />
          </IconButton>
          <IconButton
            onClick={() =>
              onDeleteCoupon({ _id: params.value, page: currentPage })
            }
            sx={{ padding: isSmallScreen ? "6px" : "8px" }}
          >
            <Delete
              color="error"
              fontSize={isSmallScreen ? "small" : "medium"}
            />
          </IconButton>
      
        </>
      ),
    },
  ];

  const rows =
    data?.coupons.map((coupon, index) => ({
      id: index + 1,
      name: coupon.name,
      discount: coupon.discount,
      expireDate: coupon.expireDate.substring(0, 10),
      Remove: coupon._id,
      actions: coupon._id,
    })) || [];

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };

  const onDeleteCoupon = async ({ _id, page }: { _id: string; page: number }) => {
    try {
      const willDelete = await swal({
        title: "Are you sure?",
        text: "Are you sure that you want to delete this category? all courses belong it will deleted",
        icon: "warning",
        dangerMode: true,
      });

      if (willDelete) {
        await deleteCouponAdminPage({ _id, page }).unwrap();
        router.refresh();
        toast.success("coupon deleted successfully");
      }
    } catch (error) {
      console.error("Delete coupon error:", error);
      const errorMessage =
        (error as { data?: { message?: string } }).data?.message ||
        "Failed to delete coupon";
      toast.error(errorMessage);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        mx: "auto",
        mt: 2,
        px: isSmallScreen ? 1 : 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        sx={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          mr: 7,
        }}
      >
        <Typography
          variant={isSmallScreen ? "h6" : "h5"}
          sx={{ my: 1, fontWeight: "bold" }}
        >
          Coupons 
        </Typography>
        {/* <Button
          variant="contained"
          size="small"
          sx={{ textTransform: "capitalize" }}
          onClick={() =>
            router.push("/admin-dashboard/categories/add-category")
          }
        >
        Add category
        </Button> */}
              <Chip
                          label="Add coupon"
                          size="small"
                          color="secondary"
                          sx={{ p: 2, cursor: "pointer" }}
                          onClick={() => router.push("/admin-dashboard/coupons/add-coupon")}
                        />
      </Stack>
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          "& .MuiDataGrid-root": {
            borderRadius: 1,
            boxShadow: theme.shadows[2],
            height: "calc(100vh - 65px)",
          },
        }}
      >
            <DataGrid
          rows={rows}
          columns={columns}
          paginationMode="server" // Use server-side pagination
          rowCount={data?.pagination.total || 0} // Total number of rows from backend
          pageSizeOptions={[5, 10, 15]} // Match backend limit options
          paginationModel={{
            page: currentPage - 1, // DataGrid uses 0-based indexing
            pageSize,
          }}
          onPaginationModelChange={(model) => {
            setCurrentPage(model.page + 1); // Convert to 1-based indexing for backend
            setPageSize(model.pageSize);
          }}
          loading={isLoading}
              localeText={{
            noRowsLabel: "📭 No data to display",
          }}
          sx={{
            fontSize: isSmallScreen ? "12px" : "14px",
            "& .MuiDataGrid-cell": {
              padding: isSmallScreen ? "4px" : "8px",
              lineHeight: 1.2,
            },
            "& .MuiDataGrid-columnHeader": {
              padding: isSmallScreen ? "4px" : "8px",
              backgroundColor: theme.palette.background.paper,
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
              fontSize: isSmallScreen ? "12px" : "14px",
            },
            "& .MuiDataGrid-virtualScroller": {
              overflowX: isSmallScreen ? "auto" : "hidden",
            },
          }}
        />
      </Box>

      {data?.pagination && data?.pagination.pagesCount > 1 && (
        <PaginationComponent
          count={data.pagination.pagesCount}
          currentPage={data.pagination.page}
          handlePageChange={handlePageChange}
        />
      )}
    </Box>
  );
};

export default AdminCategoriesPage;
