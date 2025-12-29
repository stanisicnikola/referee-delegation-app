import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { delegationsApi } from "../api";
import { matchKeys } from "./useMatches";

export const delegationKeys = {
  all: ["delegations"],
  statistics: () => [...delegationKeys.all, "statistics"],
  myDelegations: () => [...delegationKeys.all, "my-delegations"],
  matchDelegation: (matchId) => [...delegationKeys.all, "match", matchId],
  availableReferees: (matchId) => [
    ...delegationKeys.all,
    "available-referees",
    matchId,
  ],
};

export const useDelegationStatistics = () => {
  return useQuery({
    queryKey: delegationKeys.statistics(),
    queryFn: () => delegationsApi.getStatistics(),
  });
};

export const useMyDelegations = () => {
  return useQuery({
    queryKey: delegationKeys.myDelegations(),
    queryFn: () => delegationsApi.getMyDelegations(),
  });
};

export const useMatchDelegation = (matchId) => {
  return useQuery({
    queryKey: delegationKeys.matchDelegation(matchId),
    queryFn: () => delegationsApi.getMatchDelegation(matchId),
    enabled: !!matchId,
  });
};

export const useAvailableRefereesForMatch = (matchId) => {
  return useQuery({
    queryKey: delegationKeys.availableReferees(matchId),
    queryFn: () => delegationsApi.getAvailableReferees(matchId),
    enabled: !!matchId,
  });
};

export const useDelegateReferees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, data }) =>
      delegationsApi.delegateReferees(matchId, data),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({
        queryKey: delegationKeys.matchDelegation(matchId),
      });
      queryClient.invalidateQueries({
        queryKey: matchKeys.pendingDelegation(),
      });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(matchId) });
    },
  });
};

export const useUpdateRefereeRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, refereeId, data }) =>
      delegationsApi.updateRefereeRole(matchId, refereeId, data),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({
        queryKey: delegationKeys.matchDelegation(matchId),
      });
    },
  });
};

export const useRemoveRefereeFromMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, refereeId }) =>
      delegationsApi.removeReferee(matchId, refereeId),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({
        queryKey: delegationKeys.matchDelegation(matchId),
      });
      queryClient.invalidateQueries({
        queryKey: matchKeys.pendingDelegation(),
      });
    },
  });
};

export const useConfirmAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId) => delegationsApi.confirmAssignment(matchId),
    onSuccess: (_, matchId) => {
      queryClient.invalidateQueries({
        queryKey: delegationKeys.matchDelegation(matchId),
      });
      queryClient.invalidateQueries({
        queryKey: delegationKeys.myDelegations(),
      });
    },
  });
};

export const useRejectAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, data }) =>
      delegationsApi.rejectAssignment(matchId, data),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({
        queryKey: delegationKeys.matchDelegation(matchId),
      });
      queryClient.invalidateQueries({
        queryKey: delegationKeys.myDelegations(),
      });
    },
  });
};
