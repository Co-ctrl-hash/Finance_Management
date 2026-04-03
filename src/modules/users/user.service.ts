import { Role, UserStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { hashPassword } from "../../utils/password";
import { CreateUserInput } from "./user.validation";

export const createUser = async (payload: CreateUserInput) => {
  const email = payload.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("Email already exists", 409, "EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await hashPassword(payload.password);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email,
      passwordHash,
      role: payload.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

export const listUsers = async (query: {
  page: number;
  limit: number;
  role?: Role;
  status?: UserStatus;
}) => {
  const { page, limit, role, status } = query;
  const skip = (page - 1) * limit;

  const where = {
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateUserRole = async (id: string, role: Role) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });
};

export const updateUserStatus = async (id: string, status: UserStatus) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return prisma.user.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });
};
