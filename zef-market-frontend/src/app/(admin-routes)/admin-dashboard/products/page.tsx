"use client";
import { useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Box,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import toast from "react-hot-toast";
import swal from "sweetalert";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PaginationComponent from "@/app/components/PaginationComponent";
import PublishIcon from '@mui/icons-material/Publish';
import { useDeleteProductAdminInstructorPageMutation, useGetAdminDashboardProductsQuery } from "@/redux/slices/api/productApiSlice";


const InstructorCoursesPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default page size
  const { data, isLoading ,refetch} = useGetAdminDashboardProductsQuery({
    page: currentPage,
    limit: pageSize,
  });
  const [deleteProductAdminInstructorPage] =
    useDeleteProductAdminInstructorPageMutation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  console.log("dataIns", data);
    const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };



  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Serial",
      width: isSmallScreen ? 60 : 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "title",
      headerName: "Title",
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
            href={`/course/${params.row.courseId}?fromInstructorDashBoard=fromInstructorDashBoard`}
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
      field: "image",
      headerName: "Image",
      flex: 1,
      align: "center",
      headerAlign: "center",
        // flex: isSmallScreen ? 0.8 : 1,
      minWidth: isSmallScreen ? 100 : 120,
      renderCell: (params: GridRenderCellParams) => (
        <Image
          onClick={() =>
            router.push(
              `/products/${params.row.productId}?fromAdminDashBoard=fromAdminDashBoard`
            )
          }
          src={params.value}
          alt="userProfile"
          width={40}
          height={40}
          style={{
            width: "40px",
            height: "40px",
            objectFit: "cover",
            borderRadius: "50%",
            cursor: "pointer",
          }}
        />
      ),
    },
    {
      field: "category",
      headerName: "Category",
      flex: isSmallScreen ? 0.6 : 0.8,
      minWidth: isSmallScreen ? 80 : 120,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "finalPrice",
      headerName: "Price",
      flex: isSmallScreen ? 0.6 : 0.8,
      minWidth: isSmallScreen ? 80 : 120,
      align: "center",
      headerAlign: "center",
    },

      {
      field: "instructor",
      headerName: "Instructor",
      flex: isSmallScreen ? 0.8 : 0.8,
      minWidth: isSmallScreen ? 120 : 140,
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
            href={`/profile/${params.row.userId}?fromAdminDashBoard=fromAdminDashBoard`}
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
      field: "isFree",
      headerName: "Free",
      flex: isSmallScreen ? 0.6 : 0.8,
      minWidth: isSmallScreen ? 80 : 120,
      align: "center",
      headerAlign: "center",
    },
        {
      field: "isPublished",
      headerName: "Published",
      flex: isSmallScreen ? 0.6 : 0.8,
      minWidth: isSmallScreen ? 80 : 120,
      align: "center",
      headerAlign: "center",
    },

      {
      field: "remove",
      headerName: "Remove",
      width: isSmallScreen ? 80 : 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Stack
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <IconButton
            onClick={() =>
              onDeleteCourse({ _id: params.row.courseId, page: currentPage })
            }
            sx={{ padding: isSmallScreen ? "6px" : "8px" }}
          >
            <Delete
              color="error"
              fontSize={isSmallScreen ? "small" : "medium"}
            />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const rows =
    data?.products.map((product, index) => ({
      id: index + 1 + (currentPage - 1) * pageSize, // Adjust serial number for pagination
      title: product.title,
      image: product.images[0].url,
      category: product.category.title,
      finalPrice: product.finalPrice,
      createdAt: product.createdAt.substring(0, 10),
      productId: product._id,
    })) || [];

  const onDeleteCourse = async ({
    _id,
    page,
  }: {
    _id: string;
    page: number;
  }) => {
    try {
      const willDelete = await swal({
        title: "Are you sure?",
        text: "If you delete this course, all lectures, attachments, and subscriptions will be deleted.",
        icon: "warning",
        dangerMode: true,
      });

      if (willDelete) {
        await deleteProductAdminInstructorPage({ _id, page }).unwrap();
        router.refresh();
        toast.success("Course deleted successfully");
      }
    } catch (error) {
      console.error("Delete course error:", error);
      const errorMessage =
        (error as { data?: { message?: string } }).data?.message ||
        "Failed to delete course";
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
          px: 1,
        }}
      >
        <Typography
          variant={isSmallScreen ? "h6" : "h5"}
          sx={{ my: 1, fontWeight: "bold" }}
        >
          Courses
        </Typography>

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

export default InstructorCoursesPage;