# VELO - Task Completion Checklist

## After ANY Code Change

1. Run `bun run typecheck` - verify TypeScript compiles
2. Run `bun run lint` - verify code style passes
3. Run `bun run build` - verify production build succeeds
4. Test in browser with `bun run preview` if available

## After Bug Fix

- Reproduce the bug with evidence (error message, screenshot)
- Apply fix
- Verify fix resolves the issue
- Check for similar bugs in same file/module
- Run full test suite

## After New Feature

- Implement feature with types
- Add error handling
- Update any relevant documentation
- Verify build passes
- Test edge cases

## After Scraping/Data Changes

- Verify JSON output is valid
- Check scoring results make sense
- Update data history if needed
- Run `bun run lint` on generated files

## After UI Changes

- Check responsiveness (mobile/desktop)
- Verify transitions work (fly, fade, flip, scale, slide only)
- No emoji in UI
- No rounded corners beyond `rounded-sm`
- Test in preview mode

## Pre-commit Checklist

- [ ] TypeScript compiles: `bun run typecheck`
- [ ] Linting passes: `bun run lint`
- [ ] Build succeeds: `bun run build`
- [ ] No emoji in changes
- [ ] Transitions use Svelte built-ins only
