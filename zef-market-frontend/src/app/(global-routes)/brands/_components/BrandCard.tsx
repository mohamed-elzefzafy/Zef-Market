"use client";
import { Card, CardContent, CardMedia, Typography, Button, Box } from "@mui/material";
import { useRouter } from "next/navigation";

interface CategoryCardProps {
  _id:string,
  title: string;
  imageUrl: string,
}

export default function BrandCard({_id, title, imageUrl }: CategoryCardProps) {
  const router = useRouter();
   const handleExplore = () => {
    router.push(`/products?brand=${_id}`);
  };
  return (
    <Card
      sx={{
        maxWidth: 345,
        borderRadius: 3,
        boxShadow: 3,
        transition: "transform 0.3s ease",
        "&:hover": { transform: "scale(1.03)" },
      }}
    >
      {imageUrl && (
        <CardMedia
          component="img"
          height="180"
          image={imageUrl}
          alt={title}
          sx={{ objectFit: "cover" ,cursor:"pointer"}}
            onClick={handleExplore}
        />
      )}

      <CardContent sx={{ textAlign: "center" }}>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{ fontWeight: "bold" }}
        >
          {title}
        </Typography>

        <Box mt={1}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ borderRadius: "20px", textTransform: "none" }}
            onClick={handleExplore}
          >
            Explore
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
