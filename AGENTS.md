# AGENTS.md

## Toolchain

pnpm manages packages, and `pnpm-lock.yaml` is the only lockfile.

mise pins the Node and pnpm versions in `mise.toml`. Non-interactive shells skip mise activation, so a bare `pnpm` resolves to whatever global version is on `PATH`. Prefix every pnpm command with `mise exec --` to run the pinned versions:

```sh
mise exec -- pnpm install
```

## React component architecture

- `Component.constants.ts`: Defines fixed values that the component uses. Create it when two or more files share the values. It imports only from `Component.types.ts`.
- `Component.context.tsx`: Defines the React context, provider, and related consumer hook. Create it when child components share state.
- `Component.fixtures.ts`: Provides stable sample data for tests and stories. Create it when tests and stories share the data. Production files never import it.
- `Component.hooks.ts`: Contains custom hooks, reducers, and other state management logic for the component. Create it when the logic outgrows the component body.
- `Component.i18n.ts`: Defines component-specific translation keys and messages. Create it when the component shows user-facing text.
- `Component.schema.ts`: Defines runtime validation schemas for component input and form data. Create it when input or form data needs validation.
- `Component.stories.tsx`: Defines Storybook stories for the component states and interactions. Create it for every visual component.
- `Component.styles.ts`: Defines classes, styled components, and other component styles. Create it when you use CSS-in-JS. With CSS modules, use `Component.module.css` instead.
- `Component.test-utils.tsx`: Provides component-specific render functions, such as `renderComponent(overrides)`, and shared queries. Create it when several tests repeat the same setup. Production files never import it.
- `Component.test.tsx`: Tests the component behavior that a user can observe. Always create it.
- `Component.tsx`: Defines and exports the React component. Always create it. Other folders import the component directly from this file.
- `Component.types.ts`: Defines the props and other component-specific TypeScript types. Always create it for the props.
- `Component.utils.ts`: Defines pure helper functions that only support the component. Create it when the logic is worth testing on its own. It imports only from `Component.constants.ts` and `Component.types.ts`.
