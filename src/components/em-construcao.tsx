import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EmConstrucao({
  titulo,
  fase,
}: {
  titulo: string;
  fase: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>
          Módulo planejado para a {fase} do desenvolvimento. O modelo de
          dados já existe no schema do Prisma; falta a interface e as
          regras de negócio.
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
