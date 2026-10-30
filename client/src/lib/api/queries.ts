import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { api } from "./client";
import type { ListParams, QueryBrief } from "./types";

export const metaQuery = () =>
  queryOptions({ queryKey: ["meta"], queryFn: () => api.meta(), staleTime: Infinity });

export const suppliersQuery = (params: ListParams) =>
  queryOptions({
    queryKey: ["suppliers", params],
    queryFn: () => api.listSuppliers(params),
    placeholderData: keepPreviousData,
  });

export const supplierQuery = (id: number, brief?: QueryBrief | null) =>
  queryOptions({
    queryKey: ["supplier", id, brief ?? null],
    queryFn: () => api.getSupplier(id, brief),
  });

export const compareQuery = (ids: number[], brief?: QueryBrief | null) =>
  queryOptions({
    queryKey: ["compare", ids, brief ?? null],
    queryFn: () => api.compare(ids, brief),
    enabled: ids.length >= 2,
  });

export const recommendQuery = (brief: QueryBrief | null) =>
  queryOptions({
    queryKey: ["recommend", brief],
    queryFn: () => api.recommend(brief!),
    enabled: !!brief,
  });
