/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** AuditLog */
export interface AuditLog {
  /** Action */
  action: string;
  /** Resource Type */
  resource_type?: string | null;
  /** Resource Id */
  resource_id?: string | null;
  /** Details */
  details?: string | null;
  /** Id */
  id: number;
  /** User Id */
  user_id?: number | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
}

/** Credential */
export interface Credential {
  /** Title */
  title: string;
  /** Url */
  url?: string | null;
  /** Username */
  username: string;
  /** Encrypted Data */
  encrypted_data: string;
  /** Encryption Iv */
  encryption_iv: string;
  /** Id */
  id: number;
  /** User Id */
  user_id: number;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /**
   * Categories
   * @default []
   */
  categories?: PasswordCategory[];
}

/** CredentialCreate */
export interface CredentialCreate {
  /** Title */
  title: string;
  /** Url */
  url?: string | null;
  /** Username */
  username: string;
  /** Encrypted Data */
  encrypted_data: string;
  /** Encryption Iv */
  encryption_iv: string;
  /**
   * Category Ids
   * @default []
   */
  category_ids?: number[];
}

/** CredentialUpdate */
export interface CredentialUpdate {
  /** Title */
  title?: string | null;
  /** Url */
  url?: string | null;
  /** Username */
  username?: string | null;
  /** Encrypted Data */
  encrypted_data?: string | null;
  /** Encryption Iv */
  encryption_iv?: string | null;
  /** Category Ids */
  category_ids?: number[] | null;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** PasswordCategory */
export interface PasswordCategory {
  /** Name */
  name: string;
  /** Color Hex */
  color_hex?: string | null;
  /** Id */
  id: number;
  /** User Id */
  user_id: number;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** PasswordCategoryCreate */
export interface PasswordCategoryCreate {
  /** Name */
  name: string;
  /** Color Hex */
  color_hex?: string | null;
}

/** PasswordCategoryUpdate */
export interface PasswordCategoryUpdate {
  /** Name */
  name?: string | null;
  /** Color Hex */
  color_hex?: string | null;
}

/** Role */
export interface Role {
  /** Name */
  name: string;
  /** Id */
  id: number;
}

/** SecureNote */
export interface SecureNote {
  /** Encrypted Title */
  encrypted_title: string;
  /** Encrypted Content */
  encrypted_content: string;
  /** Encryption Iv */
  encryption_iv: string;
  /** Id */
  id: number;
  /** User Id */
  user_id: number;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** SecureNoteCreate */
export interface SecureNoteCreate {
  /** Encrypted Title */
  encrypted_title: string;
  /** Encrypted Content */
  encrypted_content: string;
  /** Encryption Iv */
  encryption_iv: string;
}

/** SecureNoteUpdate */
export interface SecureNoteUpdate {
  /** Encrypted Title */
  encrypted_title?: string | null;
  /** Encrypted Content */
  encrypted_content?: string | null;
  /** Encryption Iv */
  encryption_iv?: string | null;
}

/** SharedCredentialCreate */
export interface SharedCredentialCreate {
  /** Credential Id */
  credential_id: number;
  /** Recipient User Id */
  recipient_user_id: number;
  /** Encrypted Sharing Key */
  encrypted_sharing_key: string;
  /** Encrypted Shared Data */
  encrypted_shared_data: string;
  /** Sharing Iv */
  sharing_iv: string;
}

/** SharedCredentialResponse */
export interface SharedCredentialResponse {
  /** Id */
  id: number;
  /** Credential Id */
  credential_id: number;
  /** Owner User Id */
  owner_user_id: number;
  /** Recipient User Id */
  recipient_user_id: number;
  /** Encrypted Sharing Key */
  encrypted_sharing_key: string;
  /** Encrypted Shared Data */
  encrypted_shared_data: string;
  /** Sharing Iv */
  sharing_iv: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Credential Title */
  credential_title: string;
  /** Owner Username */
  owner_username: string;
}

/** Token */
export interface Token {
  /** Access Token */
  access_token: string;
  /** Token Type */
  token_type: string;
}

/** User */
export interface User {
  /** Username */
  username: string;
  /** Id */
  id: number;
  /** Avatar Url */
  avatar_url?: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /**
   * Roles
   * @default []
   */
  roles?: Role[];
}

/** UserCreate */
export interface UserCreate {
  /** Username */
  username: string;
  /** Login Password Hash */
  login_password_hash: string;
  /** Login Salt */
  login_salt: string;
  /** Encryption Salt */
  encryption_salt: string;
  /** Public Key */
  public_key?: string | null;
  /** Encrypted Private Key */
  encrypted_private_key?: string | null;
}

/** UserLogin */
export interface UserLogin {
  /** Username */
  username: string;
  /** Login Password Hash */
  login_password_hash: string;
}

/** UserPublicKey */
export interface UserPublicKey {
  /** Id */
  id: number;
  /** Username */
  username: string;
  /** Public Key */
  public_key: string;
}

/** UserSalts */
export interface UserSalts {
  /** Login Salt */
  login_salt: string;
  /** Encryption Salt */
  encryption_salt: string;
}

/** UserUpdate */
export interface UserUpdate {
  /** Avatar Url */
  avatar_url?: string | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title PassOwl API
 * @version 1.0.0
 *
 * Backend pro aplikaci PassOwl
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name ReadRootGet
   * @summary Read Root
   * @request GET:/
   */
  readRootGet = (params: RequestParams = {}) =>
    this.request<any, any>({
      path: `/`,
      method: "GET",
      format: "json",
      ...params,
    });

  auth = {
    /**
     * @description Get user's salts for login process - public endpoint
     *
     * @tags authentication
     * @name GetUserSaltsAuthSaltsGet
     * @summary Get User Salts
     * @request GET:/auth/salts
     */
    getUserSaltsAuthSaltsGet: (
      query: {
        /** Username */
        username: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<UserSalts, HTTPValidationError>({
        path: `/auth/salts`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags authentication
     * @name RegisterUserAuthRegisterPost
     * @summary Register User
     * @request POST:/auth/register
     */
    registerUserAuthRegisterPost: (
      data: UserCreate,
      params: RequestParams = {},
    ) =>
      this.request<User, HTTPValidationError>({
        path: `/auth/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags authentication
     * @name LoginUserAuthLoginPost
     * @summary Login User
     * @request POST:/auth/login
     */
    loginUserAuthLoginPost: (data: UserLogin, params: RequestParams = {}) =>
      this.request<Token, HTTPValidationError>({
        path: `/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * No description
     *
     * @tags users
     * @name GetCurrentUserInfoUsersMeGet
     * @summary Get Current User Info
     * @request GET:/users/me
     * @secure
     */
    getCurrentUserInfoUsersMeGet: (params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/users/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UpdateUserAvatarUsersMeAvatarPut
     * @summary Update User Avatar
     * @request PUT:/users/me/avatar
     * @secure
     */
    updateUserAvatarUsersMeAvatarPut: (
      data: UserUpdate,
      params: RequestParams = {},
    ) =>
      this.request<User, HTTPValidationError>({
        path: `/users/me/avatar`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Aktualizace asymetrických klíčů uživatele
     *
     * @tags users
     * @name UpdateUserKeysUsersKeysPut
     * @summary Update User Keys
     * @request PUT:/users/keys
     * @secure
     */
    updateUserKeysUsersKeysPut: (
      query: {
        /** Public Key */
        public_key: string;
        /** Encrypted Private Key */
        encrypted_private_key: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/users/keys`,
        method: "PUT",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  credentials = {
    /**
     * No description
     *
     * @tags credentials
     * @name GetCredentialsCredentialsGet
     * @summary Get Credentials
     * @request GET:/credentials/
     * @secure
     */
    getCredentialsCredentialsGet: (
      query?: {
        /**
         * Skip
         * @default 0
         */
        skip?: number;
        /**
         * Limit
         * @default 100
         */
        limit?: number;
        /** Sort By */
        sort_by?: string;
        /** Sort Direction */
        sort_direction?: string;
        /** Filter Category */
        filter_category?: number | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<Credential[], HTTPValidationError>({
        path: `/credentials/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags credentials
     * @name CreateCredentialCredentialsPost
     * @summary Create Credential
     * @request POST:/credentials/
     * @secure
     */
    createCredentialCredentialsPost: (
      data: CredentialCreate,
      params: RequestParams = {},
    ) =>
      this.request<Credential, HTTPValidationError>({
        path: `/credentials/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags credentials
     * @name GetCredentialCredentialsCredentialIdGet
     * @summary Get Credential
     * @request GET:/credentials/{credential_id}
     * @secure
     */
    getCredentialCredentialsCredentialIdGet: (
      credentialId: number,
      params: RequestParams = {},
    ) =>
      this.request<Credential, HTTPValidationError>({
        path: `/credentials/${credentialId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags credentials
     * @name UpdateCredentialCredentialsCredentialIdPut
     * @summary Update Credential
     * @request PUT:/credentials/{credential_id}
     * @secure
     */
    updateCredentialCredentialsCredentialIdPut: (
      credentialId: number,
      data: CredentialUpdate,
      params: RequestParams = {},
    ) =>
      this.request<Credential, HTTPValidationError>({
        path: `/credentials/${credentialId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags credentials
     * @name DeleteCredentialCredentialsCredentialIdDelete
     * @summary Delete Credential
     * @request DELETE:/credentials/{credential_id}
     * @secure
     */
    deleteCredentialCredentialsCredentialIdDelete: (
      credentialId: number,
      params: RequestParams = {},
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/credentials/${credentialId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  secureNotes = {
    /**
     * No description
     *
     * @tags secure-notes
     * @name GetSecureNotesSecureNotesGet
     * @summary Get Secure Notes
     * @request GET:/secure-notes/
     * @secure
     */
    getSecureNotesSecureNotesGet: (
      query?: {
        /**
         * Skip
         * @default 0
         */
        skip?: number;
        /**
         * Limit
         * @default 100
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<SecureNote[], HTTPValidationError>({
        path: `/secure-notes/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags secure-notes
     * @name CreateSecureNoteSecureNotesPost
     * @summary Create Secure Note
     * @request POST:/secure-notes/
     * @secure
     */
    createSecureNoteSecureNotesPost: (
      data: SecureNoteCreate,
      params: RequestParams = {},
    ) =>
      this.request<SecureNote, HTTPValidationError>({
        path: `/secure-notes/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags secure-notes
     * @name GetSecureNoteSecureNotesNoteIdGet
     * @summary Get Secure Note
     * @request GET:/secure-notes/{note_id}
     * @secure
     */
    getSecureNoteSecureNotesNoteIdGet: (
      noteId: number,
      params: RequestParams = {},
    ) =>
      this.request<SecureNote, HTTPValidationError>({
        path: `/secure-notes/${noteId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags secure-notes
     * @name UpdateSecureNoteSecureNotesNoteIdPut
     * @summary Update Secure Note
     * @request PUT:/secure-notes/{note_id}
     * @secure
     */
    updateSecureNoteSecureNotesNoteIdPut: (
      noteId: number,
      data: SecureNoteUpdate,
      params: RequestParams = {},
    ) =>
      this.request<SecureNote, HTTPValidationError>({
        path: `/secure-notes/${noteId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags secure-notes
     * @name DeleteSecureNoteSecureNotesNoteIdDelete
     * @summary Delete Secure Note
     * @request DELETE:/secure-notes/{note_id}
     * @secure
     */
    deleteSecureNoteSecureNotesNoteIdDelete: (
      noteId: number,
      params: RequestParams = {},
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/secure-notes/${noteId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  categories = {
    /**
     * No description
     *
     * @tags categories
     * @name GetCategoriesCategoriesGet
     * @summary Get Categories
     * @request GET:/categories/
     * @secure
     */
    getCategoriesCategoriesGet: (params: RequestParams = {}) =>
      this.request<PasswordCategory[], any>({
        path: `/categories/`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags categories
     * @name CreateCategoryCategoriesPost
     * @summary Create Category
     * @request POST:/categories/
     * @secure
     */
    createCategoryCategoriesPost: (
      data: PasswordCategoryCreate,
      params: RequestParams = {},
    ) =>
      this.request<PasswordCategory, HTTPValidationError>({
        path: `/categories/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags categories
     * @name GetCategoryCategoriesCategoryIdGet
     * @summary Get Category
     * @request GET:/categories/{category_id}
     * @secure
     */
    getCategoryCategoriesCategoryIdGet: (
      categoryId: number,
      params: RequestParams = {},
    ) =>
      this.request<PasswordCategory, HTTPValidationError>({
        path: `/categories/${categoryId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags categories
     * @name UpdateCategoryCategoriesCategoryIdPut
     * @summary Update Category
     * @request PUT:/categories/{category_id}
     * @secure
     */
    updateCategoryCategoriesCategoryIdPut: (
      categoryId: number,
      data: PasswordCategoryUpdate,
      params: RequestParams = {},
    ) =>
      this.request<PasswordCategory, HTTPValidationError>({
        path: `/categories/${categoryId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags categories
     * @name DeleteCategoryCategoriesCategoryIdDelete
     * @summary Delete Category
     * @request DELETE:/categories/{category_id}
     * @secure
     */
    deleteCategoryCategoriesCategoryIdDelete: (
      categoryId: number,
      params: RequestParams = {},
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/categories/${categoryId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  admin = {
    /**
     * No description
     *
     * @tags admin
     * @name GetAllUsersAdminUsersGet
     * @summary Get All Users
     * @request GET:/admin/users
     * @secure
     */
    getAllUsersAdminUsersGet: (
      query?: {
        /**
         * Skip
         * @default 0
         */
        skip?: number;
        /**
         * Limit
         * @default 100
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<User[], HTTPValidationError>({
        path: `/admin/users`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags admin
     * @name GetAuditLogsAdminAuditLogsGet
     * @summary Get Audit Logs
     * @request GET:/admin/audit-logs
     * @secure
     */
    getAuditLogsAdminAuditLogsGet: (
      query?: {
        /**
         * Skip
         * @default 0
         */
        skip?: number;
        /**
         * Limit
         * @default 100
         */
        limit?: number;
        /** User Id */
        user_id?: number | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<AuditLog[], HTTPValidationError>({
        path: `/admin/audit-logs`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  api = {
    /**
     * @description Sdílení hesla s jiným uživatelem
     *
     * @tags sharing
     * @name ShareCredentialApiSharingSharePost
     * @summary Share Credential
     * @request POST:/api/sharing/share
     * @secure
     */
    shareCredentialApiSharingSharePost: (
      data: SharedCredentialCreate,
      params: RequestParams = {},
    ) =>
      this.request<SharedCredentialResponse, HTTPValidationError>({
        path: `/api/sharing/share`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Získání hesel sdílených s aktuálním uživatelem
     *
     * @tags sharing
     * @name GetReceivedSharedCredentialsApiSharingReceivedGet
     * @summary Get Received Shared Credentials
     * @request GET:/api/sharing/received
     * @secure
     */
    getReceivedSharedCredentialsApiSharingReceivedGet: (
      params: RequestParams = {},
    ) =>
      this.request<SharedCredentialResponse[], any>({
        path: `/api/sharing/received`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Získání hesel, která aktuální uživatel sdílí
     *
     * @tags sharing
     * @name GetOwnedSharedCredentialsApiSharingOwnedGet
     * @summary Get Owned Shared Credentials
     * @request GET:/api/sharing/owned
     * @secure
     */
    getOwnedSharedCredentialsApiSharingOwnedGet: (params: RequestParams = {}) =>
      this.request<SharedCredentialResponse[], any>({
        path: `/api/sharing/owned`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Zrušení sdílení hesla
     *
     * @tags sharing
     * @name DeleteSharedCredentialApiSharingSharedCredentialIdDelete
     * @summary Delete Shared Credential
     * @request DELETE:/api/sharing/{shared_credential_id}
     * @secure
     */
    deleteSharedCredentialApiSharingSharedCredentialIdDelete: (
      sharedCredentialId: number,
      params: RequestParams = {},
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/sharing/${sharedCredentialId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Získání veřejného klíče uživatele
     *
     * @tags sharing
     * @name GetUserPublicKeyApiSharingUsersUserIdPublicKeyGet
     * @summary Get User Public Key
     * @request GET:/api/sharing/users/{user_id}/public-key
     * @secure
     */
    getUserPublicKeyApiSharingUsersUserIdPublicKeyGet: (
      userId: number,
      params: RequestParams = {},
    ) =>
      this.request<UserPublicKey, HTTPValidationError>({
        path: `/api/sharing/users/${userId}/public-key`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Vyhledání uživatelů pro sdílení
     *
     * @tags sharing
     * @name SearchUsersApiSharingUsersSearchGet
     * @summary Search Users
     * @request GET:/api/sharing/users/search
     * @secure
     */
    searchUsersApiSharingUsersSearchGet: (
      query: {
        /** Q */
        q: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/sharing/users/search`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  health = {
    /**
     * No description
     *
     * @name HealthCheckHealthGet
     * @summary Health Check
     * @request GET:/health
     */
    healthCheckHealthGet: (params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/health`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
}
