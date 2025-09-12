"use client";
import { useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import toast from "react-hot-toast";
import swal from "sweetalert";
import { useRouter } from "next/navigation";
import { useDeleteUserAdminPageMutation } from "@/redux/slices/api/userApiSlice";
import Image from "next/image";
import Link from "next/link";
import PaginationComponent from "@/app/components/PaginationComponent";
import {
  useDeleteReviewByAdminMutation,
  useGetAdminReviewsQuery,
} from "@/redux/slices/api/reviewApiSlice";
import {
  useDeleteInstructorRequestAdminInstructorPageMutation,
  useGetAllInstructorRequestQuery,
  useUpdateInstructorRequestStatuMutation,
} from "@/redux/slices/api/instructorRequestApiSlice";

const AdminReviewsPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, refetch } = useGetAllInstructorRequestQuery(
    `?page=${currentPage}`
  );
  const [deleteInstructorRequestAdminInstructorPage] =
    useDeleteInstructorRequestAdminInstructorPageMutation();
  const [updateInstructorRequestStatu] =
    useUpdateInstructorRequestStatuMutation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [pageSize, setPageSize] = useState(10);

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "serial",
      width: isSmallScreen ? 60 : 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "requestStatueTitle",
      headerName: "Request Statue",
      flex: isSmallScreen ? 0.8 : 1,
      minWidth: isSmallScreen ? 120 : 150,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "user",
      headerName: "User",
      flex: isSmallScreen ? 0.6 : 0.8,
      minWidth: isSmallScreen ? 80 : 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            whiteSpace: "normal",
            wordWrap: "break-word",
            lineHeight: 1.2,
            padding: "4px",
            fontWeight: "bold",
            color:
              params.row.role === "admin"
                ? "error.main"
                : params.row.role === "instructor"
                ? "secondary.main"
                : null,
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "userEmail",
      headerName: "User Email",
      flex: isSmallScreen ? 0.6 : 0.8,
      minWidth: isSmallScreen ? 80 : 120,
      align: "center",
      headerAlign: "center",
    },

    {
      field: "createdAt",
      headerName: "Since",
      flex: isSmallScreen ? 0.6 : 0.8,
      minWidth: isSmallScreen ? 80 : 100,
      align: "center",
      headerAlign: "center",
    },

    {
      field: "change-request-statu",
      headerName: "Change request statu",
      flex: isSmallScreen ? 0.8 : 0.8,
      width: isSmallScreen ? 100 : 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <>
          {params.row.requestStatueTitle === "sent" ? (
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent={"center"}
              gap={1}
            >
              <Button
                size="small"
                variant="text"
                onClick={() =>
                  handleUpdateRequestStatue("accept", params.row.Remove)
                }
                sx={{ textTransform: "capitalize" }}
              >
                Accept
              </Button>

              <Button
                size="small"
                color="error"
                variant="text"
                onClick={() =>
                  handleUpdateRequestStatue("reject", params.row.Remove)
                }
                sx={{ textTransform: "capitalize" }}
              >
                Reject
              </Button>
            </Stack>
          ) : params.row.requestStatueTitle === "accept" ? (
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent={"center"}
              gap={1}
            >
              <Button
                size="small"
                color="error"
                variant="text"
                onClick={() =>
                  handleUpdateRequestStatue("reject", params.row.Remove)
                }
                sx={{ textTransform: "capitalize" }}
              >
                Reject
              </Button>
            </Stack>
          ) : (
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent={"center"}
              gap={1}
            >
              <Button
                size="small"
                variant="text"
                onClick={() =>
                  handleUpdateRequestStatue("accept", params.row.Remove)
                }
                sx={{ textTransform: "capitalize" }}
              >
                Accept
              </Button>
            </Stack>
          )}
        </>
      ),
    },
    {
      field: "Remove",
      headerName: "remove",
      width: isSmallScreen ? 80 : 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton
            onClick={() =>
              onDeleteRequest({ _id: params.row.Remove, page: currentPage })
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
    data?.instructorRequest.map((request, index) => ({
      id: index + 1,
      requestStatueTitle: request.requestStatueTitle,
      user: request.user.firstName + " " + request.user.lastName,
      userEmail: request.user.email,
      createdAt: request.createdAt.substring(0, 10),
      Remove: request._id,
      // courseId : review.course._id,
    })) || [];

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };

  const onDeleteRequest = async ({
    _id,
    page,
  }: {
    _id: string;
    page: number;
  }) => {
    try {
      const willDelete = await swal({
        title: "Are you sure?",
        text: "Are you sure that you want to delete this review ?",
        icon: "warning",
        dangerMode: true,
      });

      if (willDelete) {
        await deleteInstructorRequestAdminInstructorPage({
          _id,
          page,
        }).unwrap();
        router.refresh();
        toast.success("review deleted successfully");
      }
    } catch (error) {
      console.error("Delete review error:", error);
      const errorMessage =
        (error as { data?: { message?: string } }).data?.message ||
        "Failed to delete review";
      toast.error(errorMessage);
    }
  };

  const handleUpdateRequestStatue = async (
    requestStatueTitle: string,
    requestId: string
  ) => {
    try {
      await updateInstructorRequestStatu({
        payLoad: { requestStatueTitle },
        requestId: requestId,
      }).unwrap();
      toast.success("instructor request updated successfully");
      router.refresh();
      refetch();
    } catch (error) {
      console.error("update  request :", error);
      const errorMessage =
        (error as { data?: { message?: string } }).data?.message ||
        "Failed to update request";
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
          Instructor Requests
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

export default AdminReviewsPage;
